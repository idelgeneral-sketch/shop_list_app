// Minimal service worker: enables "Add to Home Screen" installability.
// This app is realtime/online-first by design, so we intentionally do not
// cache API calls or app data — only pass requests straight through.
self.addEventListener('install', () => {
  self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
self.addEventListener('fetch', () => {
  // no-op: always go to network
})
