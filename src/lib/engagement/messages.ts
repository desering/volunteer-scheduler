import type { Message } from "@payload-types";
import { pretty, render, toPlainText } from "@react-email/render";
import type { Payload } from "payload";
import { notificationTypes } from "@/constants/notification-types";
import { VolunteerMessageEmail } from "@/email/templates/volunteer-message";
import { sendEmail } from "@/lib/email/send-email";
import { logger } from "@/lib/logger";
import {
  type AudienceCandidate,
  type AudienceFilter,
  describeAudience,
  matchesAudience,
} from "./audience";
import { type EngagementData, loadEngagement, loadOptedOut } from "./load";
import { fillPlaceholders, toParagraphs } from "./placeholders";
import { emptySummary } from "./shifts";
import { appUrls } from "./urls";

const ids = (list: (number | { id: number })[] | null | undefined) =>
  (list ?? []).map((x) => (typeof x === "object" ? x.id : x));

/** The audience group as stored on a Message → the pure filter shape. */
export const toAudienceFilter = (
  audience: Message["audience"],
): AudienceFilter => ({
  minShifts: audience?.minShifts,
  maxShifts: audience?.maxShifts,
  activeWithinDays: audience?.activeWithinDays,
  inactiveForDays: audience?.inactiveForDays,
  hasSkillIds: ids(audience?.hasSkills),
  lacksSkillIds: ids(audience?.lacksSkills),
  regulars: audience?.regulars,
  didShift: {
    roleContains: audience?.didShift?.roleContains,
    weekday: audience?.didShift?.weekday,
    tagIds: ids(audience?.didShift?.tags),
    withinDays: audience?.didShift?.withinDays,
  },
});

export const resolveAudience = (
  data: EngagementData,
  filter: AudienceFilter,
): AudienceCandidate[] =>
  data.volunteers
    .map((volunteer) => ({
      volunteer,
      summary: data.summaries.get(volunteer.id) ?? emptySummary(volunteer.id),
      skillIds: data.skillIdsByUser.get(volunteer.id) ?? new Set<number>(),
      regular: data.regular.get(volunteer.id) ?? {
        isRegular: false,
        basis: "rule" as const,
        shiftsInWindow: 0,
        shiftsNeeded: data.settings.regularMinShifts,
        validUntil: null,
      },
    }))
    .filter((c) => matchesAudience(c, filter, data.now))
    .sort((a, b) =>
      a.volunteer.preferredName.localeCompare(b.volunteer.preferredName),
    );

/** What the admin sees before pressing Send. */
export const previewAudience = async (payload: Payload, message: Message) => {
  const data = await loadEngagement();
  const filter = toAudienceFilter(message.audience);
  const recipients = resolveAudience(data, filter);
  const optedOut = await loadOptedOut(
    payload,
    notificationTypes.INVITATIONS.key,
  );
  const tags = await payload.find({
    collection: "tags",
    depth: 0,
    pagination: false,
  });

  const reachable = recipients.filter((r) => !optedOut.has(r.volunteer.id));

  return {
    description: describeAudience(filter, {
      skills: new Map(data.skills.map((s) => [s.id, s.title])),
      tags: new Map(tags.docs.map((t) => [t.id, t.text])),
    }),
    matching: recipients.length,
    optedOut: recipients.length - reachable.length,
    sample: reachable.slice(0, 50).map((r) => ({
      id: r.volunteer.id,
      name: r.volunteer.preferredName,
      shifts: r.summary.totalShifts,
      lastShift: r.summary.lastShift?.toISOString() ?? null,
    })),
  };
};

/**
 * Sends a message to everyone in its audience who has not switched off
 * invitations. Safe to run twice: anyone with a `sent` delivery row for this
 * message is skipped, so a crashed job can simply be retried.
 */
export const sendVolunteerMessage = async (
  payload: Payload,
  messageId: number,
) => {
  const message = await payload.findByID({
    collection: "messages",
    id: messageId,
    depth: 0,
  });
  if (message.status === "sent") return { sent: 0, failed: 0 };

  const data = await loadEngagement();
  const recipients = resolveAudience(data, toAudienceFilter(message.audience));
  const optedOut = await loadOptedOut(
    payload,
    notificationTypes.INVITATIONS.key,
  );

  const previous = await payload.find({
    collection: "message-deliveries",
    where: { message: { equals: messageId } },
    depth: 0,
    pagination: false,
  });
  const previousByUser = new Map(
    previous.docs.map((d) => [
      typeof d.user === "object" ? d.user.id : d.user,
      d,
    ]),
  );

  let sent = 0;
  let failed = 0;

  for (const { volunteer } of recipients) {
    if (optedOut.has(volunteer.id)) continue;
    const before = previousByUser.get(volunteer.id);
    if (before?.status === "sent") {
      sent++;
      continue;
    }

    const values = { name: volunteer.preferredName };
    const subject = fillPlaceholders(message.subject, values);
    let status: "sent" | "failed" = "sent";
    let error: string | undefined;

    try {
      const html = await pretty(
        await render(
          VolunteerMessageEmail({
            heading: subject,
            paragraphs: toParagraphs(fillPlaceholders(message.body, values)),
            progressUrl: appUrls.progress(),
            accountUrl: appUrls.account(),
          }),
        ),
      );
      await sendEmail({
        to: volunteer.email,
        subject,
        html,
        text: toPlainText(html),
      });
      sent++;
    } catch (e) {
      status = "failed";
      error = e instanceof Error ? e.message : String(e);
      failed++;
      logger.error(
        { err: e, messageId, userId: volunteer.id },
        "Failed to send volunteer message",
      );
    }

    const delivery = {
      user: volunteer.id,
      kind: "message" as const,
      message: messageId,
      subject,
      status,
      error,
      sentAt: new Date().toISOString(),
    };
    if (before) {
      await payload.update({
        collection: "message-deliveries",
        id: before.id,
        data: delivery,
      });
    } else {
      await payload.create({
        collection: "message-deliveries",
        data: delivery,
      });
    }
  }

  await payload.update({
    collection: "messages",
    id: messageId,
    data: {
      status: "sent",
      sentAt: new Date().toISOString(),
      recipientCount: sent,
    },
    context: { messageSystemUpdate: true },
  });

  logger.info({ messageId, sent, failed }, "Volunteer message sent");
  return { sent, failed };
};
