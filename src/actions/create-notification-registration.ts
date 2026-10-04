"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { getUser } from "@/lib/services/get-user";

export async function createNotificationRegistration(
  reg: PushSubscription,
): Promise<{ success: true } | { success: false; message: string }> {
  const { user } = await getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  const payload = await getPayload({ config });

  try {
    await payload.create({
      collection: "notification-registrations",
      data: { registration: reg, user: user.id },
    });
  } catch {
    return {
      success: false,
      message: "Unable to save notification registration",
    };
  }

  return { success: true };
}
