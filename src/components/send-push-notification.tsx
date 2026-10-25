'use server';

import webpush from 'web-push';

webpush.setVapidDetails(
  'info@desering.org',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendTestNotification(message : String = "Test Notification") {
    const payload = JSON.stringify({
    title: 'New Notification',
    body: message,
  });

  try {
    const swRegistration = await navigator.serviceWorker.ready;
    const sub = await swRegistration.pushManager.getSubscription();

    await Promise.all(webpush.sendNotification(sub, payload));
  } catch (error) {
    console.error("Failed to send push notifications:", error);
    return null;
  }
}