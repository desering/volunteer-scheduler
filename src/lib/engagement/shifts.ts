import { TZDate } from "@date-fns/tz";
import type { ShiftRecord } from "./types";

export const TIME_ZONE = "Europe/Amsterdam";
export const DAY_MS = 24 * 60 * 60 * 1000;

export const daysAgo = (now: Date, days: number) =>
  new Date(now.getTime() - days * DAY_MS);

/**
 * THE definition of "did this shift". Every count in the app (badges, the
 * regular rule, retention, message audiences) goes through here, so changing
 * what counts as a shift is a one-line change.
 *
 * Marked attended → counts, even before the end (coordinator saw them).
 * Marked no-show → never counts.
 * Not marked → counts once the event is over.
 */
export const isAttended = (shift: ShiftRecord, now: Date) => {
  if (shift.attendance === "no-show") return false;
  if (shift.attendance === "attended") return true;
  return shift.end.getTime() <= now.getTime();
};

/** 0 = Sunday … 6 = Saturday, on the Amsterdam calendar. */
export const weekdayOf = (date: Date) => new TZDate(date, TIME_ZONE).getDay();

/** "2026-10" for a date, on the Amsterdam calendar. */
export const monthKeyOf = (date: Date) => {
  const local = new TZDate(date, TIME_ZONE);
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}`;
};

export type VolunteerSummary = {
  userId: number;
  /** Attended shifts, oldest first. */
  attended: ShiftRecord[];
  totalShifts: number;
  shiftsLast30: number;
  shiftsLast90: number;
  noShows: number;
  /** Signups for shifts that have not ended yet. */
  upcoming: ShiftRecord[];
  firstShift: Date | null;
  lastShift: Date | null;
};

export const emptySummary = (userId: number): VolunteerSummary => ({
  userId,
  attended: [],
  totalShifts: 0,
  shiftsLast30: 0,
  shiftsLast90: 0,
  noShows: 0,
  upcoming: [],
  firstShift: null,
  lastShift: null,
});

export const summarize = (
  userId: number,
  shifts: ShiftRecord[],
  now: Date,
): VolunteerSummary => {
  const mine = shifts
    .filter((s) => s.userId === userId)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const attended = mine.filter((s) => isAttended(s, now));
  const since30 = daysAgo(now, 30).getTime();
  const since90 = daysAgo(now, 90).getTime();

  return {
    userId,
    attended,
    totalShifts: attended.length,
    shiftsLast30: attended.filter((s) => s.start.getTime() >= since30).length,
    shiftsLast90: attended.filter((s) => s.start.getTime() >= since90).length,
    noShows: mine.filter((s) => s.attendance === "no-show").length,
    upcoming: mine.filter(
      (s) => s.end.getTime() > now.getTime() && s.attendance !== "no-show",
    ),
    firstShift: attended[0]?.start ?? null,
    lastShift: attended.at(-1)?.start ?? null,
  };
};

/** Summaries for every user id given, including people with no shifts. */
export const summarizeAll = (
  userIds: number[],
  shifts: ShiftRecord[],
  now: Date,
) => {
  const byUser = new Map<number, ShiftRecord[]>();
  for (const shift of shifts) {
    const list = byUser.get(shift.userId);
    if (list) list.push(shift);
    else byUser.set(shift.userId, [shift]);
  }

  return new Map(
    userIds.map((id) => [id, summarize(id, byUser.get(id) ?? [], now)]),
  );
};
