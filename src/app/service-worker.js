self.addEventListener("install", () => {
  self.skipWaiting(); // automatically updates serviceworker upon refresh
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim()); // makes the
});
