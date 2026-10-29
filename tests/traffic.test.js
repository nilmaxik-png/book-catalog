import test from "node:test";
import assert from "node:assert/strict";
import { classifySpeed, formatSourceTime, getNewYorkDay, normalizeTrafficRows, parsePosition } from "../domain/traffic.js";

const day = "2026-10-28";
const row = (changes = {}) => ({
  link_id: "road-1", link_name: "Test road", borough: "Queens", speed: "30",
  travel_time: "180", status: "0", data_as_of: `${day}T15:00:00.000`,
  link_points: "40.75,-73.95 40.76,-73.96 40.77,-", ...changes
});

test("traffic colors have exact boundaries and reject missing speeds", () => {
  assert.equal(classifySpeed(0).key, "jam");
  assert.equal(classifySpeed(19.99).key, "jam");
  assert.equal(classifySpeed(20).key, "medium");
  assert.equal(classifySpeed(39.99).key, "medium");
  assert.equal(classifySpeed(40).key, "free");
  for (const value of [NaN, Infinity, -1, null]) assert.equal(classifySpeed(value), null);
});

test("map coordinates ignore truncated and out-of-area points", () => {
  assert.deepEqual(parsePosition(row().link_points), { latitude: 40.76, longitude: -73.96 });
  for (const value of [null, "", "40.7,-", "91,181", "40.7,", "40.7,-74.891"])
    assert.equal(parsePosition(value), null);
});

test("only the most recent measurement per road is used", () => {
  const segments = normalizeTrafficRows([
    row({ speed: "5", data_as_of: `${day}T14:00:00.000` }), row(),
    row({ link_id: "road-2", speed: "15" })
  ], day);
  assert.equal(segments.length, 2);
  assert.equal(segments[0].name, "Test road");
  assert.ok(Math.abs(segments[0].speedKmh - 48.28032) < 0.00001);
  assert.equal(segments[0].level.key, "free");
  assert.equal(segments[1].level.key, "medium");
});

test("a failed latest sensor reading cannot revive an older valid reading", () => {
  assert.deepEqual(normalizeTrafficRows([
    row(), row({ status: "-101", speed: "0", travel_time: "0", data_as_of: `${day}T16:00:00.000` })
  ], day), []);
});

test("old, malformed and unavailable measurements are excluded", () => {
  const values = [
    row({ data_as_of: "2026-10-27T23:59:00.000" }), row({ speed: "" }),
    row({ speed: "wrong" }), row({ status: "-101" }), row({ travel_time: "0" }),
    row({ data_as_of: "2026-02-30T12:00:00.000" }), row({ link_points: "broken" })
  ];
  assert.deepEqual(normalizeTrafficRows(values, day), []);
  assert.throws(() => normalizeTrafficRows({ error: "unavailable" }, day), /формат/);
});

test("sensor time stays unchanged while the query day follows New York", () => {
  assert.equal(formatSourceTime(`${day}T15:00:00.000`), "28.10.2026 15:00:00");
  assert.equal(getNewYorkDay(new Date("2026-10-29T01:00:00Z")), "2026-10-28");
});
