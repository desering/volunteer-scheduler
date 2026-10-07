import {
  and,
  asc,
  eq,
  gte,
  isNull,
  lte,
} from "@payloadcms/db-postgres/drizzle";
import { pretty, render, toPlainText } from "@react-email/render";
import type { Payload } from "payload";
import { notificationTypes } from "@/constants/notification-types";
import { AfterShiftEmail } from "@/email/templates/after-shift";
import { sendEmail } from "@/lib/email/send-email";
import { logger } from "@/lib/logger";
import { events, signups } from "@/payload-generated-schema";
import { format } from "@/utils/tz-format";
import { milestonesCrossed, skillProgress } from "./badges";
import {
  getEngagementSettings,
  loadAwards,
  loadNextTrainings,
  loadOptedOut,
  loadShifts,
  loadSkills,
  loadVolunteers,
} from "./load";
import { fillPlaceholders, toParagraphs } from "./placeholders";
import { regularStatus } from "./regular";
import type { EngagementSettings } from "./settings";
import { DAY_MS, isAttended } from "./shifts";
import type { ShiftRecord } from "./types";
import { appUrls } from "./urls";

/** Never look further back than this, so switching features on never mails people about old shifts. */
const LOOKBACK_DAYS = 7;
/** Per run; the job runs every few minutes, so a backlog clears quickly. */
const BATCH_SIZE = 200;

/**
 * Keeps training skills in line with attendance for one signup:
 * attended (or unmarked and over) → the event's skills are awarded;
 * no-show → awards that came from this very training are removed.
 *
 * Called by the after-shift job and whenever a coordinator changes
 * attendance, so a no-show marked late still takes the badge back.
 */
export const syncTrainingAwards = async (
  payload: Payload,
  shift: ShiftRecord,
  now: Date,
) => {
  if (shift.skillIds.length === 0) return [];

  if (shift.attendance === "no-show") {
    await payload.delete({
      collection: "skill-awards",
      where: {
        user: { equals: shift.userId },
        event: { equals: shift.eventId },
        source: { equals: "training" },
      },
    });
    return [];
  }

  if (!isAttended(shift, now)) return [];

  const existing = await payload.find({
    collection: "skill-awards",
    where: {
      user: { equals: shift.userId },
      skill: { in: shift.skillIds },
    },
    depth: 0,
    pagination: false,
  });
  const have = new Set(
    existing.docs.map((d) =>
      typeof d.skill === "object" ? d.skill.id : d.skill,
    ),
  );

  const awarded: number[] = [];
  for (const skillId of shift.skillIds) {
    if (have.has(skillId)) continue;
    await payload.create({
      collection: "skill-awards",
      data: {
        user: shift.userId,
        skill: skillId,
        source: "training",
        event: shift.eventId,
        awardedAt: shift.end.toISOString(),
      },
    });
    awarded.push(skillId);
  }
  return awarded;
};

const sendThankYou = async (
  payload: Payload,
  shift: ShiftRecord,
  userShifts: ShiftRecord[],
  newSkillIds: number[],
  settings: EngagementSettings,
  now: Date,
) => {
  const [volunteer] = await loadVolunteers(payload, {
    userIds: [shift.userId],
  });
  if (!volunteer) return;

  const [skills, awards] = await Promise.all([
    loadSkills(payload),
    loadAwards(payload, { userId: shift.userId }),
  ]);

  const attended = userShifts.filter((s) => isAttended(s, now));
  const shiftNumber = attended.filter((s) => s.start <= shift.start).length;
  const crossed = milestonesCrossed(
    shiftNumber - 1,
    shiftNumber,
    settings.milestones,
  );

  const starts = attended.map((s) => s.start);
  const regularNow = regularStatus(
    starts,
    settings,
    volunteer.regularOverride,
    now,
  );
  const regularBefore = regularStatus(
    attended.filter((s) => s.signupId !== shift.signupId).map((s) => s.start),
    settings,
    volunteer.regularOverride,
    now,
  );

  const earned = new Set(awards.map((a) => a.skillId));
  const { ready } = skillProgress(skills, earned, attended.length);
  const nextSessions = await loadNextTrainings(
    payload,
    ready.map((s) => s.id),
    now,
    userShifts.map((s) => s.eventId),
  );

  const values = {
    name: volunteer.preferredName,
    event: shift.eventTitle,
    shifts: shiftNumber,
  };
  const subject = fillPlaceholders(settings.afterShiftSubject, values);

  const html = await pretty(
    await render(
      AfterShiftEmail({
        heading: subject,
        paragraphs: toParagraphs(
          fillPlaceholders(settings.afterShiftBody, values),
        ),
        shiftNumber,
        newBadges: [
          ...skills
            .filter((s) => newSkillIds.includes(s.id))
            .map((s) => ({ badge: s.badge, label: s.title })),
          ...crossed.map((m) => ({ badge: m.badge, label: m.label })),
        ],
        becameRegular:
          regularNow.isRegular && !regularBefore.isRegular
            ? { perks: settings.perks }
            : null,
        trainings: ready
          .map((skill) => ({ skill, next: nextSessions.get(skill.id) }))
          .filter((x) => x.next)
          .slice(0, 3)
          .map(({ skill, next }) => ({
            badge: skill.badge,
            title: skill.title,
            when: next ? format(next.start, "EEEE d MMMM, HH:mm") : "",
            url: next
              ? appUrls.event({ id: next.eventId, start: next.start })
              : "",
          })),
        progressUrl: appUrls.progress(),
        scheduleUrl: appUrls.schedule(),
        accountUrl: appUrls.account(),
      }),
    ),
  );

  let status: "sent" | "failed" = "sent";
  let error: string | undefined;
  try {
    await sendEmail({
      to: volunteer.email,
      subject,
      html,
      text: toPlainText(html),
    });
  } catch (e) {
    // Not retried on purpose: a thank-you that arrives days late, or twenty
    // times, is worse than one that never arrives. The failure is recorded.
    status = "failed";
    error = e instanceof Error ? e.message : String(e);
    logger.error(
      { err: e, signupId: shift.signupId },
      "Failed to send after-shift email",
    );
  }

  await payload.create({
    collection: "message-deliveries",
    data: {
      user: shift.userId,
      kind: "after-shift",
      signup: shift.signupId,
      subject,
      status,
      error,
      sentAt: now.toISOString(),
    },
  });
};

const handleEndedShift = async (
  payload: Payload,
  signupId: number,
  userId: number,
  settings: EngagementSettings,
  now: Date,
) => {
  const userShifts = await loadShifts(payload, { userId });
  const shift = userShifts.find((s) => s.signupId === signupId);
  if (!shift || shift.attendance === "no-show") return;

  const newSkillIds = await syncTrainingAwards(payload, shift, now);

  if (!settings.afterShiftEmails) return;
  const optedOut = await loadOptedOut(
    payload,
    notificationTypes.AFTER_SHIFT.key,
  );
  if (optedOut.has(userId)) return;

  await sendThankYou(payload, shift, userShifts, newSkillIds, settings, now);
};

/**
 * Runs every few minutes (see the `process-ended-shifts` task). For each
 * signup whose shift ended at least `afterShiftDelayHours` ago and has not
 * been handled yet: award training skills, then send the thank-you email if
 * that is switched on.
 *
 * Each signup is claimed with a conditional UPDATE before anything happens,
 * so two overlapping runs can never both email the same person.
 */
export const processEndedShifts = async (
  payload: Payload,
  now = new Date(),
) => {
  const settings = await getEngagementSettings(payload);
  const db = payload.db.drizzle;

  const until = new Date(
    now.getTime() - settings.afterShiftDelayHours * 60 * 60 * 1000,
  );
  const from = new Date(now.getTime() - LOOKBACK_DAYS * DAY_MS);

  const due = await db
    .select({ id: signups.id, userId: signups.user })
    .from(signups)
    .innerJoin(events, eq(signups.event, events.id))
    .where(
      and(
        isNull(signups.afterShiftProcessedAt),
        lte(events.end_date, until.toISOString()),
        gte(events.end_date, from.toISOString()),
      ),
    )
    .orderBy(asc(events.end_date))
    .limit(BATCH_SIZE);

  let processed = 0;
  let failed = 0;

  for (const { id, userId } of due) {
    const claimed = await db
      .update(signups)
      .set({ afterShiftProcessedAt: now.toISOString() })
      .where(and(eq(signups.id, id), isNull(signups.afterShiftProcessedAt)))
      .returning({ id: signups.id });
    if (claimed.length === 0) continue;

    try {
      await handleEndedShift(payload, id, userId, settings, now);
      processed++;
    } catch (error) {
      // Release the claim so the next run retries (awards are idempotent).
      failed++;
      logger.error(
        { err: error, signupId: id },
        "Failed to process ended shift",
      );
      await db
        .update(signups)
        .set({ afterShiftProcessedAt: null })
        .where(eq(signups.id, id));
    }
  }

  return { processed, failed };
};
