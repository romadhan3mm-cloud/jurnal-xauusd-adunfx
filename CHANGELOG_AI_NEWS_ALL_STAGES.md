# v1.9.34 — AI News integrated package

- Added a Worker entrypoint to the same Wrangler static-assets project so frontend routes and backend APIs can share one deployment when the Cloudflare Git integration honors `wrangler.jsonc`.
- Added health/events/analysis/push subscription/alerts endpoints.
- Added Workers AI analysis endpoint with explicit anti-hallucination constraints and no invented consensus or live gold reaction.
- Added Cron scheduler for H-30 and H-5 reminders and KV-based idempotency markers.
- Added Web Push subscription UI and service worker notification/click handlers.
- Kept the existing XOOMAR calendar view and RiskGuard/journal math intact.

Validation status:
- Source/ZIP integrity and Worker JavaScript syntax can be checked locally.
- A full Vite production build and real Cloudflare/AI/KV/Web Push end-to-end test are not claimed unless separately run with dependencies, account bindings, and real device.
- Production requires a real KV namespace ID and VAPID secrets. Do not commit private keys.

## AI News reliability patch (pre-deployment)
- Scheduler retries failed/incomplete push deliveries for up to 3 attempts while the event reminder remains within a 5-minute recovery window.
- Successfully delivered subscriptions are recorded per reminder and skipped on retries, avoiding duplicate push messages to devices that already received them.
- The event eligibility window now permits recovery for up to 5 minutes after the scheduled event time, matching the documented recovery window.
- Successfully processed reminders remain idempotent and are not sent again by Cron retries.
- This patch is limited to `worker/ai-news-worker.js`; journal, RiskGuard, Supabase schema, and unrelated UI logic are unchanged.
- Validation performed: Node syntax checks for the Worker and service worker, plus ZIP integrity. Live XOOMAR, Cloudflare KV/Workers AI, Web Push, and production build remain unverified until network/dependencies and account configuration are available.
