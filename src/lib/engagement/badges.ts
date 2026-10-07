import type { Milestone } from "./settings";
import type { Skill } from "./types";

export type MilestoneProgress = {
  earned: Milestone[];
  next: Milestone | null;
  /** Shifts still to do for `next`. */
  toNext: number;
};

export const milestoneProgress = (
  totalShifts: number,
  milestones: Milestone[],
): MilestoneProgress => {
  const sorted = [...milestones].sort((a, b) => a.shifts - b.shifts);
  const next = sorted.find((m) => m.shifts > totalShifts) ?? null;
  return {
    earned: sorted.filter((m) => m.shifts <= totalShifts),
    next,
    toNext: next ? next.shifts - totalShifts : 0,
  };
};

/** Milestones passed when the count goes from `before` to `after`. */
export const milestonesCrossed = (
  before: number,
  after: number,
  milestones: Milestone[],
) => milestones.filter((m) => m.shifts > before && m.shifts <= after);

export type LockedSkill = {
  skill: Skill;
  /** Shifts still to do before we invite them. 0 if shifts are not the blocker. */
  shiftsToGo: number;
  /** Prerequisite skills they do not have yet. */
  missing: Skill[];
};

export type SkillProgress = {
  earned: Skill[];
  /** Not earned, and nothing stands in the way: invite them. */
  ready: Skill[];
  locked: LockedSkill[];
};

/**
 * Sorts every skill into earned / ready to learn / not yet, for one volunteer.
 * "Ready" is what powers training invitations, so the after-shift email and
 * the "My volunteering" page always agree on who is invited to what.
 */
export const skillProgress = (
  skills: Skill[],
  earnedIds: Set<number>,
  totalShifts: number,
): SkillProgress => {
  const byId = new Map(skills.map((s) => [s.id, s]));
  const result: SkillProgress = { earned: [], ready: [], locked: [] };

  for (const skill of skills) {
    if (earnedIds.has(skill.id)) {
      result.earned.push(skill);
      continue;
    }

    const missing = skill.prerequisiteIds
      .filter((id) => !earnedIds.has(id))
      .map((id) => byId.get(id))
      .filter((s): s is Skill => !!s);
    const shiftsToGo = Math.max(0, skill.inviteAfterShifts - totalShifts);

    if (missing.length === 0 && shiftsToGo === 0) result.ready.push(skill);
    else result.locked.push({ skill, shiftsToGo, missing });
  }

  return result;
};
