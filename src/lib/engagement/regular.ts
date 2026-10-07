import type { EngagementSettings } from "./settings";
import { DAY_MS } from "./shifts";
import type { RegularOverride } from "./types";

export type RegularStatus = {
  isRegular: boolean;
  /** "override" when an admin set Always/Never on the volunteer. */
  basis: "rule" | "override";
  shiftsInWindow: number;
  /** How many more shifts (in the window) until regular. 0 when regular. */
  shiftsNeeded: number;
  /**
   * When a rule-based regular stops being one if they do no further shift:
   * the moment their Nth-most-recent shift falls out of the window.
   * `null` for overrides and for non-regulars.
   */
  validUntil: Date | null;
};

type Rule = Pick<EngagementSettings, "regularMinShifts" | "regularWindowDays">;

/**
 * Who is a regular volunteer (and so gets the perks on the regular card).
 *
 * Rule: at least `regularMinShifts` attended shifts that started within the
 * last `regularWindowDays` days. A rolling window, rather than "per calendar
 * month", so nobody loses their status on the 1st of the month.
 *
 * @param attendedStarts start times of attended shifts (any order)
 */
export const regularStatus = (
  attendedStarts: Date[],
  rule: Rule,
  override: RegularOverride,
  now: Date,
): RegularStatus => {
  const windowMs = rule.regularWindowDays * DAY_MS;
  const inWindow = attendedStarts
    .filter(
      (d) =>
        d.getTime() <= now.getTime() && d.getTime() > now.getTime() - windowMs,
    )
    .sort((a, b) => b.getTime() - a.getTime());

  const shiftsInWindow = inWindow.length;
  const byRule = shiftsInWindow >= rule.regularMinShifts;

  if (override !== "auto") {
    const isRegular = override === "always";
    return {
      isRegular,
      basis: "override",
      shiftsInWindow,
      shiftsNeeded: isRegular
        ? 0
        : Math.max(0, rule.regularMinShifts - shiftsInWindow),
      validUntil: null,
    };
  }

  const nth = inWindow[rule.regularMinShifts - 1];

  return {
    isRegular: byRule,
    basis: "rule",
    shiftsInWindow,
    shiftsNeeded: Math.max(0, rule.regularMinShifts - shiftsInWindow),
    validUntil: byRule && nth ? new Date(nth.getTime() + windowMs) : null,
  };
};
