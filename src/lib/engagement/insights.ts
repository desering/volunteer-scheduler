import type { RegularStatus } from "./regular";
import type { EngagementSettings } from "./settings";
import {
  DAY_MS,
  daysAgo,
  isAttended,
  monthKeyOf,
  type VolunteerSummary,
  weekdayOf,
} from "./shifts";
import type { ShiftRecord, SkillAward, Volunteer } from "./types";

/** "2026-10" + 2 → "2026-12". */
export const addMonthsToKey = (key: string, months: number) => {
  const [y, m] = key.split("-").map(Number);
  const index = y * 12 + (m - 1) + months;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
};

export type Insights = {
  totals: {
    registered: number;
    everVolunteered: number;
    active30: number;
    active90: number;
    regulars: number;
    newThisMonth: number;
    newLastMonth: number;
    /** Average shifts per volunteer active in the last 90 days. */
    shiftsPerActiveVolunteer90: number;
  };
  /** Each step is a subset of the one before it, except "Learned a skill". */
  funnel: { label: string; count: number }[];
  /**
   * Of volunteers whose first shift was at least 60 days ago, how many came
   * back for a second shift within 60 days of their first.
   */
  returnRate: { eligible: number; returned: number; rate: number | null };
  /** Per month of first shift: how many were still coming 1, 2, 3 months later. */
  cohorts: {
    month: string;
    size: number;
    stillComing: (number | null)[];
  }[];
  /** The last 12 months, oldest first. */
  activity: {
    month: string;
    shifts: number;
    volunteers: number;
    newVolunteers: number;
  }[];
  noShows90: { noShows: number; total: number; rate: number | null };
  /** Attended shifts in the last 90 days, Monday first. */
  byWeekday90: { weekday: string; shifts: number }[];
  /** Did at least `regularMinShifts` shifts, but not in the last 30 days (nor gone > 180). */
  lapsed: { volunteer: Volunteer; summary: VolunteerSummary }[];
};

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const computeInsights = (args: {
  volunteers: Volunteer[];
  summaries: Map<number, VolunteerSummary>;
  regular: Map<number, RegularStatus>;
  awards: SkillAward[];
  shifts: ShiftRecord[];
  settings: EngagementSettings;
  now: Date;
}): Insights => {
  const { volunteers, summaries, regular, awards, shifts, settings, now } =
    args;
  const list = volunteers.map((v) => ({
    volunteer: v,
    summary: summaries.get(v.id),
  }));
  const all = list
    .map((x) => x.summary)
    .filter((s): s is VolunteerSummary => !!s);

  const thisMonth = monthKeyOf(now);
  const lastMonth = addMonthsToKey(thisMonth, -1);
  const since30 = daysAgo(now, 30);
  const since90 = daysAgo(now, 90);
  const since180 = daysAgo(now, 180);

  const firstMonthOf = (s: VolunteerSummary) =>
    s.firstShift ? monthKeyOf(s.firstShift) : null;

  const active90 = all.filter((s) => s.lastShift && s.lastShift >= since90);
  const withSkill = new Set(awards.map((a) => a.userId));

  // Return rate
  const eligible = all.filter(
    (s) => s.firstShift && s.firstShift <= daysAgo(now, 60),
  );
  const returned = eligible.filter((s) => {
    const second = s.attended[1];
    return (
      !!second &&
      !!s.firstShift &&
      second.start.getTime() - s.firstShift.getTime() <= 60 * DAY_MS
    );
  });

  // Months each volunteer was active in
  const monthsActive = new Map<number, Set<string>>();
  for (const s of all) {
    monthsActive.set(
      s.userId,
      new Set(s.attended.map((x) => monthKeyOf(x.start))),
    );
  }

  const months = Array.from({ length: 12 }, (_, i) =>
    addMonthsToKey(thisMonth, i - 11),
  );

  const cohorts = months.map((month) => {
    const members = all.filter((s) => firstMonthOf(s) === month);
    const stillComing = [1, 2, 3].map((k) => {
      const target = addMonthsToKey(month, k);
      if (target > thisMonth || members.length === 0) return null;
      return members.filter((s) => monthsActive.get(s.userId)?.has(target))
        .length;
    });
    return { month, size: members.length, stillComing };
  });

  const activity = months.map((month) => {
    let shiftCount = 0;
    let volunteerCount = 0;
    for (const s of all) {
      const n = s.attended.filter((x) => monthKeyOf(x.start) === month).length;
      shiftCount += n;
      if (n > 0) volunteerCount++;
    }
    return {
      month,
      shifts: shiftCount,
      volunteers: volunteerCount,
      newVolunteers: all.filter((s) => firstMonthOf(s) === month).length,
    };
  });

  const recentEnded = shifts.filter((s) => s.end <= now && s.end >= since90);
  const noShows = recentEnded.filter((s) => s.attendance === "no-show").length;

  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const s of shifts) {
    if (isAttended(s, now) && s.start >= since90 && s.start <= now)
      weekdayCounts[weekdayOf(s.start)]++;
  }

  const lapsed = list
    .filter(
      (x): x is { volunteer: Volunteer; summary: VolunteerSummary } =>
        !!x.summary &&
        x.summary.totalShifts >= settings.regularMinShifts &&
        !!x.summary.lastShift &&
        x.summary.lastShift < since30 &&
        x.summary.lastShift >= since180 &&
        x.summary.upcoming.length === 0,
    )
    .sort((a, b) => b.summary.totalShifts - a.summary.totalShifts);

  const atLeast = (n: number) => all.filter((s) => s.totalShifts >= n).length;

  return {
    totals: {
      registered: volunteers.length,
      everVolunteered: atLeast(1),
      active30: all.filter((s) => s.lastShift && s.lastShift >= since30).length,
      active90: active90.length,
      regulars: [...regular.values()].filter((r) => r.isRegular).length,
      newThisMonth: all.filter((s) => firstMonthOf(s) === thisMonth).length,
      newLastMonth: all.filter((s) => firstMonthOf(s) === lastMonth).length,
      shiftsPerActiveVolunteer90:
        active90.length === 0
          ? 0
          : active90.reduce((n, s) => n + s.shiftsLast90, 0) / active90.length,
    },
    funnel: [
      { label: "Signed up for an account", count: volunteers.length },
      { label: "Did a first shift", count: atLeast(1) },
      { label: "Came back (2+ shifts)", count: atLeast(2) },
      { label: "5+ shifts", count: atLeast(5) },
      { label: "10+ shifts", count: atLeast(10) },
      {
        label: "Regular right now",
        count: [...regular.values()].filter((r) => r.isRegular).length,
      },
      {
        label: "Learned at least one skill",
        count: volunteers.filter((v) => withSkill.has(v.id)).length,
      },
    ],
    returnRate: {
      eligible: eligible.length,
      returned: returned.length,
      rate: eligible.length === 0 ? null : returned.length / eligible.length,
    },
    cohorts,
    activity,
    noShows90: {
      noShows,
      total: recentEnded.length,
      rate: recentEnded.length === 0 ? null : noShows / recentEnded.length,
    },
    byWeekday90: [1, 2, 3, 4, 5, 6, 0].map((d) => ({
      weekday: WEEKDAY_LABELS[d],
      shifts: weekdayCounts[d],
    })),
    lapsed,
  };
};
