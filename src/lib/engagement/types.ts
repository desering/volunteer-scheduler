/**
 * Shared shapes for everything that answers "what has this volunteer done?".
 *
 * These are plain data, deliberately free of Payload and the database, so the
 * rules in this folder can be unit-tested with `bun test` and reused on the
 * server, in jobs and in admin views without drifting apart.
 */

/**
 * What a coordinator recorded for a signup. `null` means nobody marked it:
 * the shift then counts as attended once it is over (see `isAttended`). We
 * default to trust because asking coordinators to tick every attendee is the
 * kind of admin that never happens; they only need to act on a no-show.
 */
export type Attendance = "attended" | "no-show" | null;

/** One signup, flattened with what we need from its event and role. */
export type ShiftRecord = {
  signupId: number;
  userId: number;
  eventId: number;
  eventTitle: string;
  start: Date;
  end: Date;
  roleTitle: string;
  tagIds: number[];
  /** Skills taught at this event. Non-empty means the event is a training. */
  skillIds: number[];
  attendance: Attendance;
};

export type RegularOverride = "auto" | "always" | "never";

export type Volunteer = {
  id: number;
  preferredName: string;
  email: string;
  phoneNumber: string | null;
  createdAt: Date;
  regularOverride: RegularOverride;
};

export type SkillAward = {
  userId: number;
  skillId: number;
  source: "training" | "coordinator";
  eventId: number | null;
  awardedAt: Date;
};

export type Skill = {
  id: number;
  title: string;
  badge: string;
  prerequisiteIds: number[];
  inviteAfterShifts: number;
};
