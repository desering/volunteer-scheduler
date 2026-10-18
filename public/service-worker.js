self.addEventListener("install", () => {
  self.skipWaiting(); // automatically updates serviceworker upon refresh
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim()); // makes the
});

// pasted from https://medium.com/@vedantsaraswat_44942/configuring-push-notifications-in-a-pwa-part-1-1b8e9fe2954
self.addEventListener("push", (e) => {
  const dataObj = e.data ? e.data.json() : {};
  const notificationData = dataObj.notification ?? dataObj;
  const notificationTitle = notificationData.title;
  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.image ?? "/icon-192x192.png",
  };

  //Do some logic to fulfill the notificationOptions

  e.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions),
  );
});
