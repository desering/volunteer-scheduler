/**
 * The organisation's choices about volunteering, as edited in the admin panel
 * under Volunteers → Volunteer settings. Defaults live here, in one place, and
 * are used both as the global's field defaults and as a fallback when the
 * global has never been saved.
 */

export type Milestone = {
  shifts: number;
  label: string;
  badge: string;
};

export type EngagementSettings = {
  /** A volunteer is a regular with at least this many shifts... */
  regularMinShifts: number;
  /** ...in this many days, counted back from today. */
  regularWindowDays: number;
  /** What regulars get, one line each, shown on the regular card. */
  perks: string[];
  /** Small print on the regular card, e.g. where to show it. */
  cardNote: string;
  milestones: Milestone[];
  /** Off until an admin switches it on, so deploying this sends nothing. */
  afterShiftEmails: boolean;
  /** Wait this long after a shift ends, so coordinators can mark no-shows. */
  afterShiftDelayHours: number;
  afterShiftSubject: string;
  afterShiftBody: string;
};

export const DEFAULT_SETTINGS: EngagementSettings = {
  regularMinShifts: 4,
  regularWindowDays: 60,
  perks: ["Free meal", "30% off food and drinks"],
  cardNote: "Show this screen at the bar.",
  milestones: [
    { shifts: 1, label: "First shift", badge: "🌱" },
    { shifts: 5, label: "5 shifts", badge: "🌿" },
    { shifts: 10, label: "10 shifts", badge: "🌳" },
    { shifts: 25, label: "25 shifts", badge: "🏅" },
    { shifts: 50, label: "50 shifts", badge: "🏆" },
    { shifts: 100, label: "100 shifts", badge: "💜" },
  ],
  afterShiftEmails: false,
  afterShiftDelayHours: 3,
  afterShiftSubject: "Thank you for your shift, {name}!",
  afterShiftBody: [
    "Hi {name},",
    "Thank you for volunteering at {event}. Every shift keeps De Sering going, and we are really glad you were there.",
    "Hope to see you again soon!",
  ].join("\n\n"),
};

type RawSettings = Partial<{
  regularMinShifts: number | null;
  regularWindowDays: number | null;
  perks: { text?: string | null }[] | null;
  cardNote: string | null;
  milestones:
    | { shifts?: number | null; label?: string | null; badge?: string | null }[]
    | null;
  afterShiftEmails: boolean | null;
  afterShiftDelayHours: number | null;
  afterShiftSubject: string | null;
  afterShiftBody: string | null;
}>;

const positive = (value: number | null | undefined, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;

/**
 * Turns whatever the global holds (possibly nothing) into complete settings.
 * Empty lists stay empty on purpose: an admin who deletes every perk or every
 * milestone meant it.
 */
export const normalizeSettings = (raw?: RawSettings | null) => {
  const d = DEFAULT_SETTINGS;
  if (!raw) return d;

  return {
    regularMinShifts: positive(raw.regularMinShifts, d.regularMinShifts),
    regularWindowDays: positive(raw.regularWindowDays, d.regularWindowDays),
    perks: raw.perks
      ? raw.perks.map((p) => p.text?.trim() ?? "").filter(Boolean)
      : d.perks,
    cardNote: raw.cardNote ?? d.cardNote,
    milestones: raw.milestones
      ? raw.milestones
          .filter(
            (m): m is { shifts: number; label?: string; badge?: string } =>
              typeof m.shifts === "number" && m.shifts > 0,
          )
          .map((m) => ({
            shifts: m.shifts,
            label: m.label?.trim() || `${m.shifts} shifts`,
            badge: m.badge?.trim() || "⭐",
          }))
          .sort((a, b) => a.shifts - b.shifts)
      : d.milestones,
    afterShiftEmails: raw.afterShiftEmails ?? d.afterShiftEmails,
    afterShiftDelayHours:
      typeof raw.afterShiftDelayHours === "number" &&
      raw.afterShiftDelayHours >= 0
        ? raw.afterShiftDelayHours
        : d.afterShiftDelayHours,
    afterShiftSubject: raw.afterShiftSubject?.trim() || d.afterShiftSubject,
    afterShiftBody: raw.afterShiftBody?.trim() || d.afterShiftBody,
  } satisfies EngagementSettings;
};
