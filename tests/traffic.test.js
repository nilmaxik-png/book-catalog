import test from "node:test";
import assert from "node:assert/strict";
import { classifySpeed, formatReceivedTime, normalizeTrafficMatrix } from "../domain/traffic.js";
import { MOSCOW_ROADS } from "../domain/mapRegion.js";

const roads = MOSCOW_ROADS.slice(0, 3);
const cell = (index, changes = {}) => ({ from_index: index, to_index: index, distance: 1, time: 120, ...changes });
const matrix = cells => ({ sources_to_targets: cells.map(value => [value]) });

test("traffic colors have exact boundaries and reject missing speeds", () => {
  for (const [speed, key] of [[0, "jam"], [19.99, "jam"], [20, "medium"], [39.99, "medium"], [40, "free"]]) {
    assert.equal(classifySpeed(speed).key, key);
  }
  for (const value of [NaN, Infinity, -1, null]) assert.equal(classifySpeed(value), null);
});

test("kilometres and seconds become average speed and all three colors", () => {
  const result = normalizeTrafficMatrix(matrix([cell(0, { time: 360 }), cell(1), cell(2, { time: 60 })]), roads);
  assert.deepEqual(result.map(road => road.speedKmh), [10, 30, 60]);
  assert.deepEqual(result.map(road => road.level.key), ["jam", "medium", "free"]);
  assert.equal(result[0].name, roads[0].name);
  assert.deepEqual(result[0].position, roads[0].position);
});

test("a missing route cannot be replaced by another matrix cell", () => {
  const result = normalizeTrafficMatrix({ sources_to_targets: [
    [cell(0, { to_index: 1 })], [cell(1)], [cell(2), cell(2)]
  ] }, roads);
  assert.deepEqual(result.map(road => road.id), [roads[1].id]);
});

test("zero, negative, missing and implausible times and distances are excluded", () => {
  for (const changes of [{ time: 0 }, { time: -1 }, { time: "" }, { time: null },
    { distance: 0 }, { distance: "bad" }, { distance: true }, { distance: Infinity }, { time: 1 }]) {
    assert.deepEqual(normalizeTrafficMatrix(matrix([cell(0, changes)]), roads), []);
  }
  assert.equal(normalizeTrafficMatrix(matrix([cell(0, { distance: "1", time: "120" })]), roads)[0].speedKmh, 30);
  assert.throws(() => normalizeTrafficMatrix({ error: "unavailable" }, roads), /формат/);
});

test("route anchors and markers are in Moscow", () => {
  assert.equal(new Set(MOSCOW_ROADS.map(road => road.id)).size, MOSCOW_ROADS.length);
  for (const road of MOSCOW_ROADS) {
    for (const [latitude, longitude] of [road.start, road.end]) {
      assert.ok(latitude > 55.5 && latitude < 56 && longitude > 37.3 && longitude < 37.9);
    }
    assert.ok(road.position.latitude > 55.5 && road.position.longitude > 37.3);
  }
});

test("receipt time uses Moscow regardless of the device time zone", () => {
  assert.match(formatReceivedTime("2026-10-29T21:05:06Z"), /30\.10\.2026.*00:05:06/);
});
