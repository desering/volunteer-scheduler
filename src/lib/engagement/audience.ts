import type { RegularStatus } from "./regular";
import { daysAgo, type VolunteerSummary, weekdayOf } from "./shifts";
import type { ShiftRecord, Volunteer } from "./types";

export const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/**
 * Who a message goes to. Every filter that is set must match (AND). An empty
 * filter matches every volunteer — the preview in the admin panel shows the
 * count before anything is sent.
 */
export type AudienceFilter = {
  minShifts?: number | null;
  maxShifts?: number | null;
  /** Did a shift in the last N days. */
  activeWithinDays?: number | null;
  /** Has volunteered before, but not in the last N days ("lapsed"). */
  inactiveForDays?: number | null;
  hasSkillIds?: number[] | null;
  lacksSkillIds?: number[] | null;
  regulars?: "any" | "only" | "exclude" | null;
  /**
   * At least one attended shift matching every condition set here, e.g.
   * "a Coordinator shift on a Tuesday in the last 90 days".
   */
  didShift?: {
    roleContains?: string | null;
    weekday?: Weekday | null;
    tagIds?: number[] | null;
    withinDays?: number | null;
  } | null;
};

export type AudienceCandidate = {
  volunteer: Volunteer;
  summary: VolunteerSummary;
  skillIds: Set<number>;
  regular: RegularStatus;
};

const isSet = (n: number | null | undefined): n is number =>
  typeof n === "number" && Number.isFinite(n);

const hasAny = (list: number[] | null | undefined): list is number[] =>
  Array.isArray(list) && list.length > 0;

const shiftMatches = (
  shift: ShiftRecord,
  f: NonNullable<AudienceFilter["didShift"]>,
  now: Date,
) => {
  const role = f.roleContains?.trim().toLowerCase();
  if (role && !shift.roleTitle.toLowerCase().includes(role)) return false;
  if (f.weekday && WEEKDAYS[weekdayOf(shift.start)] !== f.weekday) return false;
  if (hasAny(f.tagIds) && !f.tagIds.some((t) => shift.tagIds.includes(t)))
    return false;
  if (isSet(f.withinDays) && shift.start < daysAgo(now, f.withinDays))
    return false;
  return true;
};

const didShiftIsSet = (f: AudienceFilter["didShift"]) =>
  !!f &&
  (!!f.roleContains?.trim() ||
    !!f.weekday ||
    hasAny(f.tagIds) ||
    isSet(f.withinDays));

export const matchesAudience = (
  c: AudienceCandidate,
  f: AudienceFilter,
  now: Date,
) => {
  const { summary } = c;

  if (isSet(f.minShifts) && summary.totalShifts < f.minShifts) return false;
  if (isSet(f.maxShifts) && summary.totalShifts > f.maxShifts) return false;

  if (isSet(f.activeWithinDays)) {
    if (!summary.lastShift) return false;
    if (summary.lastShift < daysAgo(now, f.activeWithinDays)) return false;
  }

  if (isSet(f.inactiveForDays)) {
    if (!summary.lastShift) return false;
    if (summary.lastShift >= daysAgo(now, f.inactiveForDays)) return false;
  }

  if (hasAny(f.hasSkillIds) && !f.hasSkillIds.every((id) => c.skillIds.has(id)))
    return false;
  if (
    hasAny(f.lacksSkillIds) &&
    f.lacksSkillIds.some((id) => c.skillIds.has(id))
  )
    return false;

  if (f.regulars === "only" && !c.regular.isRegular) return false;
  if (f.regulars === "exclude" && c.regular.isRegular) return false;

  if (didShiftIsSet(f.didShift)) {
    const didShift = f.didShift as NonNullable<AudienceFilter["didShift"]>;
    if (!summary.attended.some((s) => shiftMatches(s, didShift, now)))
      return false;
  }

  return true;
};

/**
 * The filter in plain words, so whoever presses "Send" can check they picked
 * the people they meant. Names are looked up by the caller.
 */
export const describeAudience = (
  f: AudienceFilter,
  names: { skills: Map<number, string>; tags: Map<number, string> },
) => {
  const parts: string[] = [];
  const skillList = (ids: number[]) =>
    ids.map((id) => names.skills.get(id) ?? `skill #${id}`).join(", ");

  if (isSet(f.minShifts) && isSet(f.maxShifts))
    parts.push(`did ${f.minShifts}–${f.maxShifts} shifts`);
  else if (isSet(f.minShifts)) parts.push(`did at least ${f.minShifts} shifts`);
  else if (isSet(f.maxShifts)) parts.push(`did at most ${f.maxShifts} shifts`);

  if (isSet(f.activeWithinDays))
    parts.push(`volunteered in the last ${f.activeWithinDays} days`);
  if (isSet(f.inactiveForDays))
    parts.push(`have not volunteered for ${f.inactiveForDays} days`);
  if (hasAny(f.hasSkillIds)) parts.push(`have ${skillList(f.hasSkillIds)}`);
  if (hasAny(f.lacksSkillIds))
    parts.push(`do not have ${skillList(f.lacksSkillIds)}`);
  if (f.regulars === "only") parts.push("are regulars");
  if (f.regulars === "exclude") parts.push("are not regulars");

  if (didShiftIsSet(f.didShift)) {
    const d = f.didShift as NonNullable<AudienceFilter["didShift"]>;
    let text = "did a";
    if (d.roleContains?.trim()) text += ` "${d.roleContains.trim()}"`;
    text += " shift";
    if (d.weekday)
      text += ` on a ${d.weekday[0].toUpperCase()}${d.weekday.slice(1)}`;
    if (hasAny(d.tagIds))
      text += ` tagged ${d.tagIds.map((id) => names.tags.get(id) ?? `#${id}`).join(" or ")}`;
    if (isSet(d.withinDays)) text += ` in the last ${d.withinDays} days`;
    parts.push(text);
  }

  return parts.length === 0
    ? "Every volunteer with an account"
    : `Volunteers who ${parts.join(", and ")}`;
};
