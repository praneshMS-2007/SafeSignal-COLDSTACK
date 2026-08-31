/// <reference lib="webworker" />

const CACHE_NAME = "safesignal-v1";
const OFFLINE_QUEUE_KEY = "safesignal-offline-queue";

const STATIC_ASSETS = [
  "/",
  "/report",
  "/triage",
  "/reports",
  "/barriers",
  "/tickets",
  "/manifest.json",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
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

// Fetch: network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // API requests: try network first
  if (url.pathname.startsWith("/api/")) {
    // For POST to /api/reports when offline, queue it
    if (event.request.method === "POST" && url.pathname === "/api/reports") {
      event.respondWith(
        fetch(event.request.clone()).catch(async () => {
          // Queue for later sync
          const body = await event.request.json();
          const queue = JSON.parse(
            (await getFromCache(OFFLINE_QUEUE_KEY)) || "[]"
          );
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
        })
      );
      return;
    }

    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((r) => r || new Response("Offline", { status: 503 }))
      )
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match("/"));
    })
  );
});

// Background sync: when back online, sync queued reports
self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "SYNC_OFFLINE_REPORTS") {
    const queue = JSON.parse(
      (await getFromCache(OFFLINE_QUEUE_KEY)) || "[]"
    );
    if (queue.length > 0) {
      try {
        const res = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reports: queue }),
        });
        if (res.ok) {
          await putInCache(OFFLINE_QUEUE_KEY, "[]");
          const clients = await self.clients.matchAll();
          clients.forEach((client) =>
            client.postMessage({ type: "SYNC_COMPLETE", data: await res.json() })
          );
        }
      } catch (e) {
        // Will retry next time
      }
    }
  }
});

// Helper: simple cache-based key-value store for offline queue
async function getFromCache(key) {
  const cache = await caches.open("safesignal-data");
  const response = await cache.match(new Request(key));
  return response ? response.text() : null;
}

async function putInCache(key, value) {
  const cache = await caches.open("safesignal-data");
  await cache.put(new Request(key), new Response(value));
}
