"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";
import { syncTrainingAwards } from "@/lib/engagement/after-shift";
import { loadShifts } from "@/lib/engagement/load";
import { requireAdmin } from "./require-admin";

const schema = z.object({
  signupId: z.number().int().positive(),
  attendance: z.enum(["attended", "no-show"]).nullable(),
});

/**
 * Marks a signup as attended / no-show (or clears it). If the shift was a
 * training that is already over, the skills follow straight away: a no-show
 * loses the badge from this training, an attendee gets it.
 */
export async function setAttendance(input: z.infer<typeof schema>) {
  await requireAdmin();
  const { signupId, attendance } = schema.parse(input);

  const payload = await getPayload({ config });
  const signup = await payload.update({
    collection: "signups",
    id: signupId,
    data: { attendance },
    depth: 0,
  });

  const userId = typeof signup.user === "object" ? signup.user.id : signup.user;
  const shift = (await loadShifts(payload, { userId })).find(
    (s) => s.signupId === signupId,
  );
  if (shift) await syncTrainingAwards(payload, shift, new Date());

  return { attendance: signup.attendance ?? null };
}
