"use server";

import config from "@payload-config";
import { getPayload } from "payload";
import { getUser } from "@/lib/services/get-user";

export async function createNotificationRegistration(
  reg: PushSubscriptionJSON,
): Promise<{ success: true } | { success: false; message: string }> {
  const { user } = await getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  if (!reg.endpoint || !reg.keys?.auth || !reg.keys.p256dh) {
    return { success: false, message: "Invalid notification registration" };
  }

  const registration = {
    endpoint: reg.endpoint,
    keys: {
      auth: reg.keys.auth,
      p256dh: reg.keys.p256dh,
    },
  };
  const payload = await getPayload({ config });

  try {
    const existing = await payload.find({
      collection: "notification-registrations",
      where: { endpoint: { equals: reg.endpoint } },
      limit: 1,
    });

    if (existing.docs[0]) {
      await payload.update({
        collection: "notification-registrations",
        id: existing.docs[0].id,
        data: { registration, user: user.id },
      });
      console.log("Registration updated in database");
    } else {
      await payload.create({
        collection: "notification-registrations",
        data: { endpoint: reg.endpoint, registration, user: user.id },
      });
      console.log("New registration saved to database");
    }
    console.log("Endpoint: ", reg.endpoint);
  } catch (error) {
    console.error("Unable to save notification registration:", error);
    return {
      success: false,
      message: "Unable to save notification registration",
    };
  }
  return { success: true };
}
