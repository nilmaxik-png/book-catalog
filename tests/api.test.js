import test from "node:test";
import assert from "node:assert/strict";
import { API_ENDPOINT, buildTrafficRequest, fetchTraffic } from "../services/trafficApi.js";
import { MOSCOW_ROADS } from "../domain/mapRegion.js";

const data = { sources_to_targets: [[{ from_index: 0, to_index: 0, distance: 1.5, time: 360 }]] };
const ok = value => async () => ({ ok: true, json: async () => value });

test("request pairs Moscow road anchors and explicitly enables traffic", () => {
  const url = new URL(API_ENDPOINT);
  assert.equal(url.hostname, "api.1traffic.ru");
  assert.equal(url.searchParams.get("traffic"), "1");
  const body = JSON.parse(buildTrafficRequest());
  assert.equal(body.sources.length, 8);
  assert.deepEqual(body.sources[0], { lat: MOSCOW_ROADS[0].start[0], lon: MOSCOW_ROADS[0].start[1] });
  assert.deepEqual(body.targets[0], { lat: MOSCOW_ROADS[0].end[0], lon: MOSCOW_ROADS[0].end[1] });
});

test("successful reply produces markers without inventing a sensor timestamp", async () => {
  const result = await fetchTraffic({ fetchImpl: async (url, request) => {
    assert.equal(url, API_ENDPOINT);
    assert.equal(request.method, "POST");
    assert.match(request.headers["Content-Type"], /^text\/plain/);
    assert.deepEqual(JSON.parse(request.body), JSON.parse(buildTrafficRequest()));
    return { ok: true, json: async () => data };
  } });
  assert.equal(result.segments[0].speedKmh, 15);
  assert.equal(result.segments[0].level.key, "jam");
  assert.equal(result.segments[0].observedAt, undefined);
  assert.ok(Number.isFinite(Date.parse(result.receivedAt)));
});

test("HTTP failures and shared demo throttling have readable messages", async () => {
  await assert.rejects(fetchTraffic({ fetchImpl: async () => ({ ok: false, status: 503 }) }), /503/);
  await assert.rejects(fetchTraffic({ fetchImpl: async () => ({ ok: false, status: 429 }) }), /временно занят/);
});

test("empty, malformed and network replies cannot generate fake traffic", async () => {
  await assert.rejects(fetchTraffic({ fetchImpl: ok({ sources_to_targets: [] }) }), /не вернул/);
  await assert.rejects(fetchTraffic({ fetchImpl: ok({ wrong: true }) }), /формат/);
  await assert.rejects(fetchTraffic({ fetchImpl: async () => ({ ok: true, json: async () => { throw new Error(); } }) }), /прочитать/);
  await assert.rejects(fetchTraffic({ fetchImpl: async () => { throw new TypeError(); } }), /подключение/);
});

test("slow requests time out and cancelled requests stay cancelled", async () => {
  const pending = (_, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => reject(Object.assign(new Error("cancel"), { name: "AbortError" })), { once: true });
  });
  await assert.rejects(fetchTraffic({ fetchImpl: pending, timeoutMs: 10 }), /не ответил/);
  const controller = new AbortController();
  const request = fetchTraffic({ fetchImpl: pending, signal: controller.signal });
  controller.abort();
  await assert.rejects(request, { name: "AbortError" });
  await assert.rejects(fetchTraffic({ fetchImpl: pending, signal: controller.signal }), { name: "AbortError" });
});
