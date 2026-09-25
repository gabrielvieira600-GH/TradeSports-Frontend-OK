const DEFAULT_URL = '/dashboard';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data?.json() || {};
  } catch (_) {
    payload = { body: event.data?.text() || '' };
  }

  const title = payload.title || 'TradeSports';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/android-chrome-192x192.png',
    badge: payload.badge || '/favicon-96x96.png',
    tag: payload.tag || `tradesports_${Date.now()}`,
    data: payload.data || { url: DEFAULT_URL },
    renotify: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const rawUrl = event.notification.data?.url || DEFAULT_URL;
  let destination = new URL(DEFAULT_URL, self.location.origin);
  try {
    const candidate = new URL(rawUrl, self.location.origin);
    if (candidate.origin === self.location.origin) destination = candidate;
  } catch (_) {}

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (windows) => {
      for (const client of windows) {
        if ('navigate' in client) await client.navigate(destination.href);
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow(destination.href);
    })
  );
});
