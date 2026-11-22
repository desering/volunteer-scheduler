"use server";

import * as webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (!publicKey || !privateKey) {
  throw new Error("VAPID keys are not configured. Run: bun run generate:vapid");
}

webpush.setVapidDetails("mailto:info@desering.org", publicKey, privateKey);

export async function sendTestNotification(
  message: string,
  sub: PushSubscriptionJSON,
) {
  const payload = JSON.stringify({
    title: "New Notification",
    body: message,
  });

  try {
    await webpush.sendNotification(sub, payload);
    console.log("Notification sent");
  } catch (error) {
    console.error("Failed to send push notifications:", error);
    return null;
  }
}
