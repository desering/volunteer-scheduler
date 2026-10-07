"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";
import { requireAdmin } from "./require-admin";

const schema = z.object({
  userId: z.number().int().positive(),
  skillId: z.number().int().positive(),
  eventId: z.number().int().positive().optional(),
});

/** A coordinator taught someone a skill on the spot. */
export async function awardSkill(input: z.infer<typeof schema>) {
  const admin = await requireAdmin();
  const { userId, skillId, eventId } = schema.parse(input);

  const payload = await getPayload({ config });
  const existing = await payload.count({
    collection: "skill-awards",
    where: { user: { equals: userId }, skill: { equals: skillId } },
  });
  if (existing.totalDocs > 0) return { created: false };

  await payload.create({
    collection: "skill-awards",
    data: {
      user: userId,
      skill: skillId,
      event: eventId,
      source: "coordinator",
      awardedBy: admin.id,
      awardedAt: new Date().toISOString(),
    },
  });
  return { created: true };
}
