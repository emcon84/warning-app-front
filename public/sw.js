// Service Worker — Reportes Reconquista
// Maneja: push notifications, notificación de click, cache básico

const CACHE_NAME = "rq-v1";

// ── Install & Activate ───────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Push ─────────────────────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Reportes Reconquista", body: event.data?.text() || "" };
  }

  const title = data.title || "Reportes Reconquista";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icon-192x192.png",
    badge: "/icon-192x192.png",
    // soporta tanto { url } top-level como { data: { url } }
    data: { url: data.url || data.data?.url || "/" },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: data.tag || "rq-notification",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click ────────────────────────────────────────────────────────

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Si ya hay una ventana abierta, enfocala y navegá
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Si no, abrir nueva ventana
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// ── Fetch (pass-through, sin cache agresivo) ─────────────────────────────────

self.addEventListener("fetch", (event) => {
  // Solo cachear assets estáticos de Next
  if (event.request.url.includes("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  }
  // Todo lo demás: red directa
});
