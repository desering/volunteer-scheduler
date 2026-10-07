import { describe, expect, it } from "bun:test";
import { describeAudience, matchesAudience } from "./audience";
import { milestoneProgress, milestonesCrossed, skillProgress } from "./badges";
import { toCsv } from "./csv";
import { addMonthsToKey, computeInsights } from "./insights";
import { fillPlaceholders, toParagraphs } from "./placeholders";
import { regularStatus } from "./regular";
import { DEFAULT_SETTINGS, normalizeSettings } from "./settings";
import { DAY_MS, isAttended, summarize, summarizeAll } from "./shifts";
import type { ShiftRecord, Skill, Volunteer } from "./types";

const NOW = new Date("2026-10-07T12:00:00Z");
const ago = (days: number) => new Date(NOW.getTime() - days * DAY_MS);

let nextId = 1;
const shift = (
  over: Partial<ShiftRecord> & { daysAgo?: number } = {},
): ShiftRecord => {
  const start = over.start ?? ago(over.daysAgo ?? 1);
  return {
    signupId: nextId++,
    userId: 1,
    eventId: nextId,
    eventTitle: "Lunch",
    start,
    end: over.end ?? new Date(start.getTime() + 3 * 60 * 60 * 1000),
    roleTitle: "Kitchen",
    tagIds: [],
    skillIds: [],
    attendance: null,
    ...over,
  };
};

const volunteer = (id: number, over: Partial<Volunteer> = {}): Volunteer => ({
  id,
  preferredName: `Volunteer ${id}`,
  email: `v${id}@example.org`,
  phoneNumber: null,
  createdAt: ago(400),
  regularOverride: "auto",
  ...over,
});

const rule = { regularMinShifts: 4, regularWindowDays: 60 };

describe("isAttended", () => {
  it("counts an unmarked shift only once it is over", () => {
    expect(isAttended(shift({ daysAgo: 1 }), NOW)).toBe(true);
    expect(isAttended(shift({ daysAgo: -1 }), NOW)).toBe(false);
  });

  it("never counts a no-show and always counts a marked attendee", () => {
    expect(isAttended(shift({ daysAgo: 1, attendance: "no-show" }), NOW)).toBe(
      false,
    );
    expect(
      isAttended(shift({ daysAgo: -1, attendance: "attended" }), NOW),
    ).toBe(true);
  });
});

describe("summarize", () => {
  it("counts attended shifts, no-shows and upcoming separately", () => {
    const s = summarize(
      1,
      [
        shift({ daysAgo: 100 }),
        shift({ daysAgo: 40 }),
        shift({ daysAgo: 10 }),
        shift({ daysAgo: 5, attendance: "no-show" }),
        shift({ daysAgo: -3 }),
        shift({ daysAgo: 2, userId: 2 }),
      ],
      NOW,
    );
    expect(s.totalShifts).toBe(3);
    expect(s.shiftsLast30).toBe(1);
    expect(s.shiftsLast90).toBe(2);
    expect(s.noShows).toBe(1);
    expect(s.upcoming).toHaveLength(1);
    expect(s.firstShift).toEqual(ago(100));
    expect(s.lastShift).toEqual(ago(10));
  });

  it("includes people who never did a shift", () => {
    const all = summarizeAll([1, 2], [shift({ userId: 1 })], NOW);
    expect(all.get(2)?.totalShifts).toBe(0);
    expect(all.get(2)?.lastShift).toBeNull();
  });
});

describe("regularStatus", () => {
  it("makes someone a regular with enough shifts inside the window", () => {
    const starts = [ago(50), ago(30), ago(20), ago(10), ago(90)];
    const status = regularStatus(starts, rule, "auto", NOW);
    expect(status.isRegular).toBe(true);
    expect(status.shiftsInWindow).toBe(4);
    // The 4th most recent shift (50 days ago) leaves the window in 10 days.
    expect(status.validUntil).toEqual(
      new Date(ago(50).getTime() + 60 * DAY_MS),
    );
  });

  it("says how many shifts are missing", () => {
    const status = regularStatus([ago(61), ago(5), ago(3)], rule, "auto", NOW);
    expect(status.isRegular).toBe(false);
    expect(status.shiftsNeeded).toBe(2);
    expect(status.validUntil).toBeNull();
  });

  it("lets an admin override the rule both ways", () => {
    expect(regularStatus([], rule, "always", NOW).isRegular).toBe(true);
    const never = regularStatus(
      [ago(1), ago(2), ago(3), ago(4)],
      rule,
      "never",
      NOW,
    );
    expect(never.isRegular).toBe(false);
    expect(never.basis).toBe("override");
  });

  it("ignores shifts in the future", () => {
    const starts = [ago(1), ago(2), ago(3), ago(-2)];
    expect(regularStatus(starts, rule, "auto", NOW).isRegular).toBe(false);
  });
});

describe("badges", () => {
  const milestones = DEFAULT_SETTINGS.milestones;

  it("reports earned milestones and the next one", () => {
    const p = milestoneProgress(7, milestones);
    expect(p.earned.map((m) => m.shifts)).toEqual([1, 5]);
    expect(p.next?.shifts).toBe(10);
    expect(p.toNext).toBe(3);
  });

  it("finds milestones crossed by one more shift", () => {
    expect(milestonesCrossed(4, 5, milestones).map((m) => m.shifts)).toEqual([
      5,
    ]);
    expect(milestonesCrossed(5, 6, milestones)).toEqual([]);
  });

  it("sorts skills into earned, ready and locked", () => {
    const skills: Skill[] = [
      {
        id: 1,
        title: "Onboarding",
        badge: "👋",
        prerequisiteIds: [],
        inviteAfterShifts: 0,
      },
      {
        id: 2,
        title: "Kitchen",
        badge: "🔪",
        prerequisiteIds: [1],
        inviteAfterShifts: 3,
      },
      {
        id: 3,
        title: "Coordinator",
        badge: "🧭",
        prerequisiteIds: [2],
        inviteAfterShifts: 10,
      },
      {
        id: 4,
        title: "Bar",
        badge: "☕",
        prerequisiteIds: [1],
        inviteAfterShifts: 0,
      },
    ];
    const p = skillProgress(skills, new Set([1]), 2);
    expect(p.earned.map((s) => s.id)).toEqual([1]);
    expect(p.ready.map((s) => s.id)).toEqual([4]);
    expect(
      p.locked.map((l) => [
        l.skill.id,
        l.shiftsToGo,
        l.missing.map((m) => m.id),
      ]),
    ).toEqual([
      [2, 1, []],
      [3, 8, [2]],
    ]);
  });
});

describe("matchesAudience", () => {
  const candidate = (
    shifts: ShiftRecord[],
    skills: number[] = [],
    isRegular = false,
  ) => ({
    volunteer: volunteer(1),
    summary: summarize(1, shifts, NOW),
    skillIds: new Set(skills),
    regular: regularStatus(
      shifts.map((s) => s.start),
      rule,
      isRegular ? "always" : "never",
      NOW,
    ),
  });

  it("matches everyone with an empty filter", () => {
    expect(matchesAudience(candidate([]), {}, NOW)).toBe(true);
  });

  it("filters on number of shifts, including people who never came", () => {
    const newbie = candidate([]);
    expect(matchesAudience(newbie, { maxShifts: 0 }, NOW)).toBe(true);
    expect(matchesAudience(newbie, { minShifts: 1 }, NOW)).toBe(false);
  });

  it("finds lapsed volunteers but not people who never came", () => {
    expect(
      matchesAudience(
        candidate([shift({ daysAgo: 45 })]),
        { inactiveForDays: 30 },
        NOW,
      ),
    ).toBe(true);
    expect(
      matchesAudience(
        candidate([shift({ daysAgo: 5 })]),
        { inactiveForDays: 30 },
        NOW,
      ),
    ).toBe(false);
    expect(matchesAudience(candidate([]), { inactiveForDays: 30 }, NOW)).toBe(
      false,
    );
  });

  it("filters on skills and regular status", () => {
    const c = candidate([shift()], [1], true);
    expect(matchesAudience(c, { hasSkillIds: [1] }, NOW)).toBe(true);
    expect(matchesAudience(c, { lacksSkillIds: [1] }, NOW)).toBe(false);
    expect(matchesAudience(c, { regulars: "exclude" }, NOW)).toBe(false);
  });

  it("answers 'did a Coordinator shift on a Tuesday in the last 90 days', in Amsterdam time", () => {
    // Monday 23:30 UTC is already Tuesday 01:30 in Amsterdam.
    const lateMonday = new Date("2026-09-28T23:30:00Z");
    const c = candidate([
      shift({ start: lateMonday, roleTitle: "Shift coordinator" }),
    ]);
    const filter = {
      didShift: {
        roleContains: "coordinator",
        weekday: "tuesday" as const,
        withinDays: 90,
      },
    };
    expect(matchesAudience(c, filter, NOW)).toBe(true);
    expect(
      matchesAudience(
        c,
        { didShift: { ...filter.didShift, weekday: "monday" as const } },
        NOW,
      ),
    ).toBe(false);
    expect(
      matchesAudience(
        c,
        { didShift: { ...filter.didShift, withinDays: 5 } },
        NOW,
      ),
    ).toBe(false);
  });

  it("describes the filter in words", () => {
    const text = describeAudience(
      { minShifts: 3, lacksSkillIds: [2], didShift: { weekday: "sunday" } },
      { skills: new Map([[2, "Kitchen"]]), tags: new Map() },
    );
    expect(text).toBe(
      "Volunteers who did at least 3 shifts, and do not have Kitchen, and did a shift on a Sunday",
    );
    expect(describeAudience({}, { skills: new Map(), tags: new Map() })).toBe(
      "Every volunteer with an account",
    );
  });
});

describe("text helpers", () => {
  it("fills known placeholders and leaves unknown ones visible", () => {
    expect(fillPlaceholders("Hi {name}, {oops}", { name: "Sam" })).toBe(
      "Hi Sam, {oops}",
    );
  });

  it("splits paragraphs on blank lines", () => {
    expect(toParagraphs("a\nb\n\n\n c \n")).toEqual(["a\nb", "c"]);
  });

  it("writes CSV that spreadsheets cannot execute but keeps phone numbers", () => {
    const csv = toCsv(
      ["name", "phone"],
      [
        ["=HYPERLINK(1)", "+31 6 1234 5678"],
        ['Say "hi"', null],
      ],
    );
    expect(csv).toBe(
      '"name","phone"\r\n"\'=HYPERLINK(1)","+31 6 1234 5678"\r\n"Say ""hi""",""',
    );
  });
});

describe("normalizeSettings", () => {
  it("falls back to defaults when nothing is saved", () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps an emptied list empty and repairs nonsense numbers", () => {
    const s = normalizeSettings({
      perks: [],
      regularMinShifts: 0,
      milestones: [{ shifts: 10 }, { shifts: 2, label: "Two", badge: "✌️" }],
    });
    expect(s.perks).toEqual([]);
    expect(s.regularMinShifts).toBe(DEFAULT_SETTINGS.regularMinShifts);
    expect(s.milestones).toEqual([
      { shifts: 2, label: "Two", badge: "✌️" },
      { shifts: 10, label: "10 shifts", badge: "⭐" },
    ]);
  });
});

describe("computeInsights", () => {
  it("measures return rate, cohorts, no-shows and lapsed volunteers", () => {
    const shifts = [
      // 1: first shift in July, came back within 60 days, still coming → active
      shift({ userId: 1, start: new Date("2026-07-10T10:00:00Z") }),
      shift({ userId: 1, start: new Date("2026-08-01T10:00:00Z") }),
      shift({ userId: 1, start: new Date("2026-10-01T10:00:00Z") }),
      // 2: first shift in July, never came back
      shift({ userId: 2, start: new Date("2026-07-20T10:00:00Z") }),
      // 3: experienced, gone quiet for ~2 months → lapsed
      ...[150, 120, 100, 80, 60].map((d) => shift({ userId: 3, daysAgo: d })),
      // 4: a no-show last week
      shift({ userId: 4, daysAgo: 7, attendance: "no-show" }),
    ];
    const volunteers = [1, 2, 3, 4, 5].map((id) => volunteer(id));
    const summaries = summarizeAll(
      volunteers.map((v) => v.id),
      shifts,
      NOW,
    );
    const regular = new Map(
      volunteers.map((v) => [
        v.id,
        regularStatus(
          summaries.get(v.id)?.attended.map((s) => s.start) ?? [],
          rule,
          "auto",
          NOW,
        ),
      ]),
    );

    const insights = computeInsights({
      volunteers,
      summaries,
      regular,
      awards: [],
      shifts,
      settings: DEFAULT_SETTINGS,
      now: NOW,
    });

    expect(insights.totals.registered).toBe(5);
    expect(insights.totals.everVolunteered).toBe(3);
    expect(insights.totals.active30).toBe(1);
    expect(insights.returnRate).toEqual({
      eligible: 3,
      returned: 2,
      rate: 2 / 3,
    });

    const july = insights.cohorts.find((c) => c.month === "2026-07");
    expect(july?.size).toBe(2);
    expect(july?.stillComing).toEqual([1, 0, 1]);
    expect(
      insights.cohorts.find((c) => c.month === "2026-10")?.stillComing,
    ).toEqual([null, null, null]);

    expect(insights.noShows90.noShows).toBe(1);
    expect(insights.lapsed.map((l) => l.volunteer.id)).toEqual([3]);
    expect(insights.funnel[2]).toEqual({
      label: "Came back (2+ shifts)",
      count: 2,
    });
  });

  it("does month arithmetic across a year boundary", () => {
    expect(addMonthsToKey("2026-11", 3)).toBe("2027-02");
    expect(addMonthsToKey("2026-01", -1)).toBe("2025-12");
  });
});
