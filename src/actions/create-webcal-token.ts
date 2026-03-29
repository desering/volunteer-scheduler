"use server";

import config from "@payload-config";
import { revalidatePath } from "next/cache";
import { getPayload } from "payload";
import { getUser } from "@/lib/services/get-user";

export async function createWebcalToken(): Promise<
  { success: true } | { success: false; message: string }
> {
  const { user } = await getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  const payload = await getPayload({ config });

  // Catches the case where token already exists, since it's unique per user.
  // But it could also be another error, so leaving this message generic.
  try {
    await payload.create({
      collection: "webcal-tokens",
      data: { token: crypto.randomUUID(), user: user.id },
    });
  } catch {
    return { success: false, message: "Unable to create a webcal token." };
  }

  revalidatePath("/account");
  return { success: true };
}
