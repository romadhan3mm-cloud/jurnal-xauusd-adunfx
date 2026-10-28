# TraderLogs AI News — Stage 3 (Scheduler foundation)

## Included
- Separate Cloudflare Worker entrypoint at `worker/ai-news-worker.js`.
- Cron Trigger configured for once per minute.
- Fetches the existing XOOMAR calendar source from the server, not from the user's open browser.
- Filters high-impact events and a focused list of gold-relevant US releases.
- Queues reminder records for 30 minutes and 5 minutes before release.
- Uses KV idempotency keys to avoid duplicate queued reminders.
- Read-only endpoints: `/health`, `/api/status`, `/api/alerts?limit=20`.
- Keeps the main TraderLogs `wrangler.jsonc`, journal math, and Supabase schema unchanged.

## Important Stage 3 boundary
This stage queues reminder records only. It does **not** send push notifications to phones yet; push subscription and delivery are Stage 4. The worker must be deployed separately and configured with a real KV namespace ID and the exact deployed TraderLogs origin before it can run.

## Deployment
1. Install project dependencies in the extracted project folder: `npm install`.
2. Create a KV namespace: `npx wrangler kv namespace create ALERTS_KV`.
3. Copy the returned namespace ID into `wrangler.ai-news.jsonc` replacing `REPLACE_WITH_KV_NAMESPACE_ID`.
4. Replace `https://REPLACE_WITH_YOUR_TRADERLOGS_DOMAIN` with the exact production origin (scheme + host, no trailing slash).
5. Deploy from the project folder: `npx wrangler deploy --config wrangler.ai-news.jsonc`.
6. Open the Worker URL plus `/health`; then `/api/status`. The first Cron run can take up to about a minute.
7. Do not call the stage complete until the health endpoint, successful Cron run, and queued reminder test are verified.

## Limits and safety
- Provider event names/importance values may change; inspect live provider payloads before relying on filtering.
- Provider schedules can be corrected or cancelled. This stage does not yet reconcile previously queued alerts after schedule changes; improve this before push delivery.
- Calendar provider is external and may be stale or unavailable.
- No consensus forecast is fabricated. AI analysis is not part of this stage.
- No trades, lot sizes, stop loss, daily risk cap, or journal entries are modified.
- Do not put API keys, Supabase service-role keys, or other secrets in frontend files or this config.
