"use client";

import { createNotificationRegistration } from "@/actions/create-notification-registration";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);

  const result = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index++) {
    result[index] = rawData.charCodeAt(index);
  }
  return result;
}

export async function registerPushNotification(): Promise<PushSubscription | null> {
  console.log("Trying to register notifications");
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("Notification permission was not granted.");
    return null;
  }

  if (!("PushManager" in window && "Notification" in window)) {
    console.log("Push messaging isn't supported.");
    return null;
  }

  try {
    const swRegistration = await navigator.serviceWorker.ready;
    console.log("Service worker state:", swRegistration.active?.state);

    const existingSubscription =
      await swRegistration.pushManager.getSubscription();

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured");
    }

    const subscription =
      existingSubscription ??
      (await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }));

    const result = await createNotificationRegistration(subscription.toJSON());
    if (!result.success) {
      throw new Error(result.message);
    }

    console.log("Notification registration success");
    return subscription;
  } catch (error) {
    console.error("Failed to register for push notifications:", error);
    return null;
  }
}
