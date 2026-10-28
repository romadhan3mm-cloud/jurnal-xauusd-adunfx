const CALENDAR_URL = "https://xoomar.com/api/markets/calendar";
const TZ = "Asia/Jakarta";
const LEAD_MINUTES = [30, 5];
const ALERT_TTL_SECONDS = 7 * 24 * 60 * 60;
const EVENT_TTL_SECONDS = 14 * 24 * 60 * 60;

const GOLD_RELEVANT = [
  /consumer price index|\bcpi\b/i,
  /personal consumption expenditures|\bpce\b/i,
  /non.?farm payroll|payroll employment|employment situation/i,
  /unemployment rate|initial jobless claims|continuing jobless claims/i,
  /fomc|federal funds rate|interest rate decision|fed interest rate|powell|federal reserve/i,
  /producer price index|\bppi\b/i,
  /gross domestic product|\bgdp\b/i,
  /retail sales/i,
  /ism manufacturing|ism services|pmi/i,
  /jolts|job openings/i,
  /average hourly earnings|employment cost index/i,
  /consumer confidence|michigan sentiment/i,
];

function json(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "vary": "Origin",
    },
  });
}

function slug(value) {
  return String(value || "event")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "event";
}

function isHighImpact(event) {
  const impact = String(event?.importance || "").toLowerCase();
  return impact === "high" || impact === "3" || impact === "high impact";
}

function isGoldRelevant(event) {
  const name = String(event?.eventName || "");
  return GOLD_RELEVANT.some((pattern) => pattern.test(name));
}

function normalizeEvent(event) {
  const scheduledAt = new Date(event?.scheduledAt);
  if (!event?.eventName || Number.isNaN(scheduledAt.getTime())) return null;
  return {
    id: String(event.id || `${slug(event.eventName)}-${scheduledAt.toISOString()}`),
    eventName: String(event.eventName),
    scheduledAt: scheduledAt.toISOString(),
    importance: String(event.importance || "unknown"),
    previous: event.previous ?? null,
    actual: event.actual ?? null,
    unit: event.unit ?? null,
    periodLabel: event.periodLabel ?? null,
    source: event.source || "XOOMAR",
    sourceUrl: "https://xoomar.com/markets/api/calendar",
  };
}

async function fetchEvents() {
  const response = await fetch(CALENDAR_URL, {
    headers: { accept: "application/json", "user-agent": "TraderLogs-AINews/1.9.31" },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Calendar provider returned HTTP ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload?.data)) throw new Error("Calendar provider response did not contain data[]");
  return payload.data.map(normalizeEvent).filter(Boolean);
}

async function processSchedule(env, now = Date.now()) {
  if (!env.ALERTS_KV) throw new Error("Missing ALERTS_KV binding");
  const events = await fetchEvents();
  let created = 0;
  let skipped = 0;
  const nowIso = new Date(now).toISOString();

  for (const event of events) {
    const eventTime = Date.parse(event.scheduledAt);
    // Only alert for upcoming releases, high impact or specifically gold-relevant medium-impact releases.
    const highImpact = isHighImpact(event);
    const relevant = isGoldRelevant(event);
    if (!highImpact && !relevant) continue;
    if (eventTime < now - 60_000 || eventTime > now + 8 * 24 * 60 * 60 * 1000) continue;

    for (const leadMinutes of LEAD_MINUTES) {
      const dueAt = eventTime - leadMinutes * 60_000;
      // Cron runs once per minute. A 60-second window plus an idempotency marker avoids missed edges and duplicates.
      if (dueAt < now - 60_000 || dueAt > now + 1_000) continue;
      const key = `alert:${event.id}:${eventTime}:${leadMinutes}`;
      const existing = await env.ALERTS_KV.get(key);
      if (existing) {
        skipped++;
        continue;
      }
      const alert = {
        id: key,
        eventId: event.id,
        eventName: event.eventName,
        scheduledAt: event.scheduledAt,
        scheduledAtWIB: new Intl.DateTimeFormat("id-ID", {
          timeZone: TZ, dateStyle: "medium", timeStyle: "short", hour12: false,
        }).format(new Date(event.scheduledAt)),
        leadMinutes,
        impact: event.importance,
        source: event.source,
        sourceUrl: event.sourceUrl,
        status: "queued_for_push_stage",
        createdAt: nowIso,
        message: `${event.eventName} dijadwalkan ${leadMinutes} menit lagi. Periksa spread, lot rencana, dan SL sebelum rilis.`,
      };
      await env.ALERTS_KV.put(key, JSON.stringify(alert), { expirationTtl: ALERT_TTL_SECONDS });
      await env.ALERTS_KV.put(`event:${event.id}:${eventTime}`, JSON.stringify(event), { expirationTtl: EVENT_TTL_SECONDS });
      created++;
    }
  }

  await env.ALERTS_KV.put("meta:last-run", JSON.stringify({
    status: "ok", checkedAt: nowIso, eventsReceived: events.length, alertsQueued: created, duplicatesSkipped: skipped,
  }), { expirationTtl: EVENT_TTL_SECONDS });
  return { eventsReceived: events.length, alertsQueued: created, duplicatesSkipped: skipped };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = env.ALLOWED_ORIGIN || "*";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "access-control-max-age": "86400",
      "vary": "Origin",
    }});
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, origin);

    if (url.pathname === "/health") {
      const lastRun = await env.ALERTS_KV?.get("meta:last-run", "json");
      return json({ service: "TraderLogs AI News Scheduler", stage: 3, status: "online", timezone: TZ, lastRun: lastRun || null, pushDelivery: "not configured in Stage 3" }, 200, origin);
    }
    if (url.pathname === "/api/alerts") {
      const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") || 20)));
      const listed = await env.ALERTS_KV.list({ prefix: "alert:", limit: 1000 });
      const alerts = [];
      for (const key of listed.keys) {
        const value = await env.ALERTS_KV.get(key.name, "json");
        if (value) alerts.push(value);
      }
      alerts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      return json({ alerts: alerts.slice(0, limit), count: alerts.length, note: "Stage 3 queues alert records; actual phone push delivery is Stage 4." }, 200, origin);
    }
    if (url.pathname === "/api/status") {
      const lastRun = await env.ALERTS_KV?.get("meta:last-run", "json");
      return json({ status: lastRun?.status || "waiting_for_first_cron", lastRun: lastRun || null, timezone: TZ, leadMinutes: LEAD_MINUTES }, 200, origin);
    }
    return json({ error: "Not found" }, 404, origin);
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil((async () => {
      try {
        await processSchedule(env);
      } catch (error) {
        const record = { status: "error", checkedAt: new Date().toISOString(), message: String(error?.message || error) };
        await env.ALERTS_KV?.put("meta:last-run", JSON.stringify(record), { expirationTtl: EVENT_TTL_SECONDS });
        console.error("AI News scheduler failed:", error);
      }
    })());
  },
};
