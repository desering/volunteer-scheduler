import config from "@payload-config";
import { and, eq, gte } from "@payloadcms/db-postgres/drizzle";
import { getPayload } from "payload";
import { regular_card_views } from "@/payload-generated-schema";
import { milestoneProgress, skillProgress } from "./badges";
import {
  getEngagementSettings,
  loadAwards,
  loadNextTrainings,
  loadShifts,
  loadSkills,
  loadVolunteers,
} from "./load";
import { regularStatus } from "./regular";
import { summarize } from "./shifts";

/**
 * Everything the "My volunteering" page and the regular card show for one
 * volunteer, computed with the same rules as the admin screens and emails.
 */
export const getVolunteerProgress = async (
  userId: number,
  now = new Date(),
) => {
  const payload = await getPayload({ config });
  const [shifts, [volunteer], skills, awards, settings] = await Promise.all([
    loadShifts(payload, { userId }),
    loadVolunteers(payload, { userIds: [userId] }),
    loadSkills(payload),
    loadAwards(payload, { userId }),
    getEngagementSettings(payload),
  ]);

  const summary = summarize(userId, shifts, now);
  const regular = regularStatus(
    summary.attended.map((s) => s.start),
    settings,
    volunteer?.regularOverride ?? "auto",
    now,
  );
  const progress = skillProgress(
    skills,
    new Set(awards.map((a) => a.skillId)),
    summary.totalShifts,
  );
  const nextSessions = await loadNextTrainings(
    payload,
    progress.ready.map((s) => s.id),
    now,
    shifts.map((s) => s.eventId),
  );
  const nextShift = summary.upcoming[0] ?? null;

  return {
    name: volunteer?.preferredName ?? "",
    summary: {
      totalShifts: summary.totalShifts,
      shiftsLast90: summary.shiftsLast90,
      firstShift: summary.firstShift,
      lastShift: summary.lastShift,
      nextShift: nextShift
        ? {
            eventId: nextShift.eventId,
            title: nextShift.eventTitle,
            start: nextShift.start,
          }
        : null,
    },
    regular,
    rule: {
      minShifts: settings.regularMinShifts,
      windowDays: settings.regularWindowDays,
    },
    perks: settings.perks,
    cardNote: settings.cardNote,
    milestones: milestoneProgress(summary.totalShifts, settings.milestones),
    skills: {
      earned: progress.earned,
      ready: progress.ready.map((skill) => ({
        skill,
        next: nextSessions.get(skill.id) ?? null,
      })),
      locked: progress.locked,
    },
  };
};

export type VolunteerProgress = Awaited<
  ReturnType<typeof getVolunteerProgress>
>;

/** At most one logged opening per volunteer per this many hours. */
const CARD_VIEW_THROTTLE_HOURS = 4;

/** Logs that a regular opened their card (see the RegularCardViews collection). */
export const logCardView = async (userId: number, now = new Date()) => {
  const payload = await getPayload({ config });
  const since = new Date(
    now.getTime() - CARD_VIEW_THROTTLE_HOURS * 60 * 60 * 1000,
  );
  const recent = await payload.db.drizzle
    .select({ id: regular_card_views.id })
    .from(regular_card_views)
    .where(
      and(
        eq(regular_card_views.user, userId),
        gte(regular_card_views.viewedAt, since.toISOString()),
      ),
    )
    .limit(1);
  if (recent.length > 0) return;

  await payload.create({
    collection: "regular-card-views",
    data: { user: userId, viewedAt: now.toISOString() },
  });
};
