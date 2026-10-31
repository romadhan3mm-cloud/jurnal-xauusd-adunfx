// Tes Worker: pembatas permintaan, pemeriksaan asal, dan rute statis. Jalankan: npm test
import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/ai-news-worker.js";

function fakeKV() {
  const store = new Map();
  return {
    async get(key, type) {
      if (!store.has(key)) return null;
      const v = store.get(key);
      return type === "json" ? JSON.parse(v) : v;
    },
    async put(key, value) { store.set(key, String(value)); },
    async delete(key) { store.delete(key); },
    async list() { return { keys: [] }; },
  };
}
const makeEnv = (extra = {}) => ({
  ALERTS_KV: fakeKV(),
  AI: { run: async () => ({ response: "{}" }) },
  ...extra,
});
const post = (path, body, headers = {}) =>
  new Request(`https://app.test${path}`, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });

test("analyze: lewat 10 permintaan per 10 menit dari IP yang sama dijawab 429", async () => {
  const env = makeEnv();
  const ip = { "cf-connecting-ip": "203.0.113.7" };
  for (let i = 0; i < 10; i++) {
    const r = await worker.fetch(post("/api/ai-news/analyze", { event: { eventName: "CPI" } }, ip), env);
    assert.notEqual(r.status, 429, `permintaan ke-${i + 1} tidak boleh dibatasi`);
  }
  const blocked = await worker.fetch(post("/api/ai-news/analyze", { event: { eventName: "CPI" } }, ip), env);
  assert.equal(blocked.status, 429);
  const body = await blocked.json();
  assert.match(body.error, /Terlalu banyak/);
});

test("analyze: IP lain tidak ikut terbatasi", async () => {
  const env = makeEnv();
  for (let i = 0; i < 11; i++) await worker.fetch(post("/api/ai-news/analyze", { event: { eventName: "CPI" } }, { "cf-connecting-ip": "198.51.100.1" }), env);
  const other = await worker.fetch(post("/api/ai-news/analyze", { event: { eventName: "CPI" } }, { "cf-connecting-ip": "198.51.100.2" }), env);
  assert.notEqual(other.status, 429);
});

test("analyze: tanpa KV pembatas tidak memblokir (tidak merusak fitur)", async () => {
  const env = { AI: { run: async () => ({ response: "{}" }) } };
  for (let i = 0; i < 12; i++) {
    const r = await worker.fetch(post("/api/ai-news/analyze", { event: { eventName: "CPI" } }, { "cf-connecting-ip": "203.0.113.9" }), env);
    assert.notEqual(r.status, 429);
  }
});

test("POST lintas asal (Origin berbeda) ditolak 403", async () => {
  const r = await worker.fetch(post("/api/ai-news/analyze", { event: {} }, { origin: "https://evil.test" }), makeEnv());
  assert.equal(r.status, 403);
});

test("POST dengan Origin yang sama tidak ditolak", async () => {
  const r = await worker.fetch(post("/api/ai-news/analyze", { event: { eventName: "CPI" } }, { origin: "https://app.test", "cf-connecting-ip": "203.0.113.20" }), makeEnv());
  assert.notEqual(r.status, 403);
});

test("subscribe: endpoint push dari host tak dikenal ditolak 400", async () => {
  const r = await worker.fetch(post("/api/ai-news/subscribe", { endpoint: "https://evil.test/push", keys: { p256dh: "a", auth: "b" } }, { "cf-connecting-ip": "203.0.113.30" }), makeEnv());
  assert.equal(r.status, 400);
});

test("subscribe: lewat 20 permintaan per jam dari IP yang sama dijawab 429", async () => {
  const env = makeEnv();
  const ip = { "cf-connecting-ip": "203.0.113.40" };
  for (let i = 0; i < 20; i++) await worker.fetch(post("/api/ai-news/subscribe", { endpoint: "https://evil.test/x", keys: {} }, ip), env);
  const blocked = await worker.fetch(post("/api/ai-news/subscribe", { endpoint: "https://evil.test/x", keys: {} }, ip), env);
  assert.equal(blocked.status, 429);
});

test("rute non-API diteruskan ke aset statis", async () => {
  const env = makeEnv({ ASSETS: { fetch: async () => new Response("index", { status: 200 }) } });
  const r = await worker.fetch(new Request("https://app.test/"), env);
  assert.equal(r.status, 200);
  assert.equal(await r.text(), "index");
});

test("rute API yang tidak dikenal dijawab 404", async () => {
  const r = await worker.fetch(new Request("https://app.test/api/ai-news/tidak-ada"), makeEnv());
  assert.equal(r.status, 404);
});
