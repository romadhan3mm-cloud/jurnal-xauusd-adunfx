// Cloudflare Pages Function: forwards only AI News API requests to the dedicated Worker.
// In Pages > Settings > Bindings, configure a Service binding named AI_NEWS_WORKER
// that targets the deployed Worker running worker/ai-news-worker.js.
export async function onRequest(context) {
  const service = context.env?.AI_NEWS_WORKER;
  if (!service || typeof service.fetch !== "function") {
    return Response.json(
      { error: "Backend AI News belum terhubung. Konfigurasikan Service binding AI_NEWS_WORKER di Cloudflare Pages." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  // Keep the original path, method, headers, query string, and body intact.
  const upstream = new Request(context.request);
  return service.fetch(upstream);
}
