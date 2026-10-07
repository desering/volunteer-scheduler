import config from "@payload-config";
import { and, asc, eq, gt, inArray } from "@payloadcms/db-postgres/drizzle";
import { getPayload, type Payload } from "payload";
import {
  events,
  events_rels,
  roles,
  signups,
  skill_awards,
  skills,
  skills_rels,
  user_notification_preferences,
  users,
} from "@/payload-generated-schema";
import { regularStatus } from "./regular";
import { normalizeSettings } from "./settings";
import { summarizeAll } from "./shifts";
import type {
  Attendance,
  ShiftRecord,
  Skill,
  SkillAward,
  Volunteer,
} from "./types";

/*
 * Server-only data loading for the engagement features.
 *
 * These read the database directly through Drizzle (typed by the generated
 * `payload-generated-schema.ts`) instead of `payload.find`, for two reasons:
 * the Signups collection computes `title` and `totalShifts` with one extra
 * query PER ROW, which is fine for a page of signups and ruinous for "every
 * signup ever"; and every caller here is trusted server code that applies its
 * own access check. Nothing in this file may be imported into a client
 * component.
 */

const toDate = (value: string) => new Date(value);

export const loadShifts = async (
  payload: Payload,
  filter: { userId?: number; userIds?: number[]; eventId?: number } = {},
): Promise<ShiftRecord[]> => {
  const db = payload.db.drizzle;
  if (filter.userIds && filter.userIds.length === 0) return [];

  const conditions = [
    filter.userId !== undefined ? eq(signups.user, filter.userId) : undefined,
    filter.userIds ? inArray(signups.user, filter.userIds) : undefined,
    filter.eventId !== undefined
      ? eq(signups.event, filter.eventId)
      : undefined,
  ].filter((c) => c !== undefined);
  const filtered = conditions.length > 0;

  const rows = await db
    .select({
      signupId: signups.id,
      userId: signups.user,
      attendance: signups.attendance,
      eventId: events.id,
      eventTitle: events.title,
      start: events.start_date,
      end: events.end_date,
      roleTitle: roles.title,
    })
    .from(signups)
    .innerJoin(events, eq(signups.event, events.id))
    .innerJoin(roles, eq(signups.role, roles.id))
    .where(filtered ? and(...conditions) : undefined);

  const eventIds = [...new Set(rows.map((r) => r.eventId))];
  const rels =
    eventIds.length === 0
      ? []
      : await db
          .select({
            eventId: events_rels.parent,
            path: events_rels.path,
            tagId: events_rels.tagsID,
            skillId: events_rels.skillsID,
          })
          .from(events_rels)
          .where(filtered ? inArray(events_rels.parent, eventIds) : undefined);

  const tagsByEvent = new Map<number, number[]>();
  const skillsByEvent = new Map<number, number[]>();
  for (const rel of rels) {
    if (rel.path === "tags" && rel.tagId) {
      tagsByEvent.set(rel.eventId, [
        ...(tagsByEvent.get(rel.eventId) ?? []),
        rel.tagId,
      ]);
    }
    if (rel.path === "skills" && rel.skillId) {
      skillsByEvent.set(rel.eventId, [
        ...(skillsByEvent.get(rel.eventId) ?? []),
        rel.skillId,
      ]);
    }
  }

  return rows.map((r) => ({
    signupId: r.signupId,
    userId: r.userId,
    eventId: r.eventId,
    eventTitle: r.eventTitle,
    start: toDate(r.start),
    end: toDate(r.end),
    roleTitle: r.roleTitle,
    tagIds: tagsByEvent.get(r.eventId) ?? [],
    skillIds: skillsByEvent.get(r.eventId) ?? [],
    attendance: (r.attendance ?? null) as Attendance,
  }));
};

export const loadVolunteers = async (
  payload: Payload,
  filter: { userIds?: number[] } = {},
): Promise<Volunteer[]> => {
  if (filter.userIds && filter.userIds.length === 0) return [];

  const rows = await payload.db.drizzle
    .select({
      id: users.id,
      preferredName: users.preferredName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      createdAt: users.createdAt,
      regularOverride: users.regularOverride,
    })
    .from(users)
    .where(filter.userIds ? inArray(users.id, filter.userIds) : undefined);

  return rows.map((r) => ({
    ...r,
    createdAt: toDate(r.createdAt),
    regularOverride: r.regularOverride ?? "auto",
  }));
};

export const loadSkills = async (payload: Payload): Promise<Skill[]> => {
  const db = payload.db.drizzle;
  const [rows, rels] = await Promise.all([
    db
      .select({
        id: skills.id,
        title: skills.title,
        badge: skills.badge,
        inviteAfterShifts: skills.inviteAfterShifts,
      })
      .from(skills)
      .orderBy(skills.title),
    db
      .select({ parent: skills_rels.parent, skillId: skills_rels.skillsID })
      .from(skills_rels)
      .where(eq(skills_rels.path, "prerequisites")),
  ]);

  return rows.map((r) => ({
    ...r,
    inviteAfterShifts: r.inviteAfterShifts ?? 0,
    prerequisiteIds: rels
      .filter((rel) => rel.parent === r.id && rel.skillId)
      .map((rel) => rel.skillId as number),
  }));
};

export const loadAwards = async (
  payload: Payload,
  filter: { userId?: number; userIds?: number[] } = {},
): Promise<SkillAward[]> => {
  if (filter.userIds && filter.userIds.length === 0) return [];
  const rows = await payload.db.drizzle
    .select({
      userId: skill_awards.user,
      skillId: skill_awards.skill,
      source: skill_awards.source,
      eventId: skill_awards.event,
      awardedAt: skill_awards.awardedAt,
    })
    .from(skill_awards)
    .where(
      filter.userId !== undefined
        ? eq(skill_awards.user, filter.userId)
        : filter.userIds
          ? inArray(skill_awards.user, filter.userIds)
          : undefined,
    );

  return rows.map((r) => ({ ...r, awardedAt: toDate(r.awardedAt) }));
};

export type UpcomingTraining = {
  eventId: number;
  title: string;
  start: Date;
};

/**
 * The next session of each skill's training, skipping events the volunteer
 * is already signed up for.
 */
export const loadNextTrainings = async (
  payload: Payload,
  skillIds: number[],
  now: Date,
  excludeEventIds: number[] = [],
) => {
  const next = new Map<number, UpcomingTraining>();
  if (skillIds.length === 0) return next;

  const rows = await payload.db.drizzle
    .select({
      eventId: events.id,
      title: events.title,
      start: events.start_date,
      skillId: events_rels.skillsID,
    })
    .from(events_rels)
    .innerJoin(events, eq(events_rels.parent, events.id))
    .where(
      and(
        eq(events_rels.path, "skills"),
        inArray(events_rels.skillsID, skillIds),
        gt(events.start_date, now.toISOString()),
      ),
    )
    .orderBy(asc(events.start_date));

  for (const row of rows) {
    if (!row.skillId || next.has(row.skillId)) continue;
    if (excludeEventIds.includes(row.eventId)) continue;
    next.set(row.skillId, {
      eventId: row.eventId,
      title: row.title,
      start: toDate(row.start),
    });
  }
  return next;
};

/** Ids of users who switched off a notification type for email. */
export const loadOptedOut = async (payload: Payload, type: string) => {
  const rows = await payload.db.drizzle
    .select({ userId: user_notification_preferences.user })
    .from(user_notification_preferences)
    .where(
      and(
        eq(user_notification_preferences.type, type),
        eq(user_notification_preferences.channel, "email"),
        eq(user_notification_preferences.preference, false),
      ),
    );
  return new Set(rows.map((r) => r.userId));
};

export const getEngagementSettings = async (payload: Payload) => {
  const raw = await payload.findGlobal({
    slug: "volunteer-settings",
    depth: 0,
  });
  return normalizeSettings(raw);
};

/**
 * Everything the admin screens need, loaded once: volunteers, all shifts,
 * skills, awards, settings, and per-volunteer summaries and regular status.
 */
export const loadEngagement = async (now = new Date()) => {
  const payload = await getPayload({ config });
  const [volunteers, shifts, skillList, awards, settings] = await Promise.all([
    loadVolunteers(payload),
    loadShifts(payload),
    loadSkills(payload),
    loadAwards(payload),
    getEngagementSettings(payload),
  ]);

  const summaries = summarizeAll(
    volunteers.map((v) => v.id),
    shifts,
    now,
  );

  const regular = new Map(
    volunteers.map((v) => [
      v.id,
      regularStatus(
        summaries.get(v.id)?.attended.map((s) => s.start) ?? [],
        settings,
        v.regularOverride,
        now,
      ),
    ]),
  );

  const skillIdsByUser = new Map<number, Set<number>>();
  for (const a of awards) {
    const set = skillIdsByUser.get(a.userId) ?? new Set<number>();
    set.add(a.skillId);
    skillIdsByUser.set(a.userId, set);
  }

  return {
    payload,
    now,
    volunteers,
    shifts,
    skills: skillList,
    awards,
    settings,
    summaries,
    regular,
    skillIdsByUser,
  };
};

export type EngagementData = Awaited<ReturnType<typeof loadEngagement>>;
