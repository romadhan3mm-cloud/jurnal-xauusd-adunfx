self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data?.text() || "Ada pembaruan AI News." }; }
  event.waitUntil(self.registration.showNotification(data.title || "TraderLogs · AI News", {
    body: data.body || "Pengingat rilis ekonomi XAU/USD.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "traderlogs-ai-news",
    data: { url: data.url || "/" },
    renotify: false
  }));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const client of list) if (client.url.startsWith(self.location.origin) && "focus" in client) return client.focus();
    return clients.openWindow ? clients.openWindow(target) : undefined;
  }));
});
