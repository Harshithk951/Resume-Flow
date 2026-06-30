// Clears a stale service worker left by another app/extension on localhost.
// ResumeFlow is not a PWA — this file exists only to unregister and stop 404 noise.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.registration
      .unregister()
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      })
  );
});
