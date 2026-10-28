import test from "node:test";
import assert from "node:assert/strict";
import { buildTrafficUrl, fetchTraffic } from "../services/trafficApi.js";

const now = new Date("2026-10-29T01:00:00Z");
const row = {
  link_id: "road", link_name: "A road", speed: "10", travel_time: "120", status: "0",
  data_as_of: "2026-10-28T18:00:00.000", link_points: "40.75,-73.95", borough: "Manhattan"
};
const ok = value => async () => ({ ok: true, json: async () => value });

test("query asks for latest readings for the source city's day", () => {
  const url = new URL(buildTrafficUrl(now));
  assert.equal(url.hostname, "data.cityofnewyork.us");
  assert.equal(url.searchParams.get("$limit"), "500");
  assert.match(url.searchParams.get("$where"), /2026-10-28T00:00:00/);
  assert.match(url.searchParams.get("$order"), /^data_as_of DESC/);
});

test("a successful API reply becomes colored road markers", async () => {
  const result = await fetchTraffic({ fetchImpl: ok([row]), now });
  assert.equal(result.segments.length, 1);
  assert.equal(result.segments[0].level.key, "jam");
  assert.equal(result.newestObservation, row.data_as_of);
  assert.ok(Number.isFinite(Date.parse(result.receivedAt)));
});

test("HTTP failures and throttling have readable messages", async () => {
  await assert.rejects(fetchTraffic({ fetchImpl: async () => ({ ok: false, status: 503 }), now }), /503/);
  await assert.rejects(fetchTraffic({ fetchImpl: async () => ({ ok: false, status: 429 }), now }), /много запросов/);
});

test("empty, malformed and stale replies cannot generate fake current traffic", async () => {
  await assert.rejects(fetchTraffic({ fetchImpl: ok([]), now }), /Нет корректных/);
  await assert.rejects(fetchTraffic({ fetchImpl: ok({ wrong: true }), now }), /формат/);
  await assert.rejects(fetchTraffic({ fetchImpl: ok([{ ...row, data_as_of: "2026-10-27T18:00:00.000" }]), now }), /Нет корректных/);
});

test("slow requests time out and cancelled requests stay cancelled", async () => {
  const pending = (_, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => reject(Object.assign(new Error("cancel"), { name: "AbortError" })), { once: true });
  });
  await assert.rejects(fetchTraffic({ fetchImpl: pending, now, timeoutMs: 10 }), /не ответил/);
  const controller = new AbortController();
  const request = fetchTraffic({ fetchImpl: pending, now, signal: controller.signal });
  controller.abort();
  await assert.rejects(request, { name: "AbortError" });
});
