// SafeSignal Service Worker v2 (Production safe)

const CACHE_NAME = "safesignal-v2";
const OFFLINE_QUEUE_KEY = "safesignal-offline-queue";

const STATIC_ASSETS = [
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/images/oil_safety_banner.jpg",
];

// Install: cache public static assets safely
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          fetch(url).then((res) => {
            if (res.ok) return cache.put(url, res);
          }).catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests (except offline report queueing)
  if (event.request.method !== "GET") {
    if (event.request.method === "POST" && url.pathname === "/api/reports") {
      event.respondWith(
        fetch(event.request.clone()).catch(async () => {
          try {
            const body = await event.request.json();
            const queue = JSON.parse((await getFromCache(OFFLINE_QUEUE_KEY)) || "[]");
            queue.push({
              ...body,
              offlineId: Date.now().toString(),
              offlineCreatedAt: new Date().toISOString(),
            });
            await putInCache(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

            return new Response(
              JSON.stringify({
                report: { id: `offline-${Date.now()}`, status: "PENDING" },
                classification: null,
                needsCoach: false,
                offline: true,
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          } catch {
            return new Response(JSON.stringify({ error: "Failed to queue offline report" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }
        })
      );
    }
    return;
  }

  // Network first for all HTML navigation and API routes
  if (event.request.mode === "navigate" || url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache first for static images and assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});

// Background sync: when back online, sync queued reports
self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "SYNC_OFFLINE_REPORTS") {
    try {
      const queue = JSON.parse((await getFromCache(OFFLINE_QUEUE_KEY)) || "[]");
      if (queue.length > 0) {
        const res = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reports: queue }),
        });
        if (res.ok) {
          await putInCache(OFFLINE_QUEUE_KEY, "[]");
          const clients = await self.clients.matchAll();
          clients.forEach((client) =>
            client.postMessage({ type: "SYNC_COMPLETE", data: res.status })
          );
        }
      }
    } catch {
      // Retry next time online
    }
  }
});

// Helper functions for Cache Storage
async function getFromCache(key) {
  try {
    const cache = await caches.open("safesignal-data");
    const response = await cache.match(new Request(key));
    return response ? await response.text() : null;
  } catch {
    return null;
  }
}

async function putInCache(key, value) {
  try {
    const cache = await caches.open("safesignal-data");
    await cache.put(new Request(key), new Response(value));
  } catch {
    // Ignore cache storage errors
  }
}
