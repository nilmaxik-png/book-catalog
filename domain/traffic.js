export const TRAFFIC_LEVELS = Object.freeze({
  free: { key: "free", label: "Свободно", color: "#16803c", range: "от 40 км/ч" },
  medium: { key: "medium", label: "Средняя загрузка", color: "#e5ad05", range: "20–40 км/ч" },
  jam: { key: "jam", label: "Пробка", color: "#d12b35", range: "менее 20 км/ч" }
});

export function classifySpeed(speedKmh) {
  if (!Number.isFinite(speedKmh) || speedKmh < 0) return null;
  if (speedKmh < 20) return TRAFFIC_LEVELS.jam;
  if (speedKmh < 40) return TRAFFIC_LEVELS.medium;
  return TRAFFIC_LEVELS.free;
}

function number(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

function timestamp(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/);
  if (!match) return null;
  const [year, month, day, hour, minute, second] = match.slice(1, 7).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (year < 2000 || date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month
      || date.getUTCDate() !== day || date.getUTCHours() !== hour
      || date.getUTCMinutes() !== minute || date.getUTCSeconds() !== second) return null;
  return `${value.slice(0, 19)}.${(match[7] || "").padEnd(3, "0")}`;
}

export function getNewYorkDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(now);
  const value = type => parts.find(part => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function formatSourceTime(value) {
  const valid = timestamp(value);
  if (!valid) return "нет времени измерения";
  const [date, time] = valid.split("T");
  return `${date.split("-").reverse().join(".")} ${time.slice(0, 8)}`;
}

export function parsePosition(value) {
  if (typeof value !== "string") return null;
  const points = value.trim().split(/\s+/).flatMap(pair => {
    const parts = pair.split(",");
    if (parts.length !== 2) return [];
    const latitude = number(parts[0]);
    const longitude = number(parts[1]);
    if (latitude === null || longitude === null || latitude < 40.4 || latitude > 41.1
        || longitude < -74.4 || longitude > -73.5) return [];
    return [{ latitude, longitude }];
  });
  return points.length ? points[Math.floor(points.length / 2)] : null;
}

export function normalizeTrafficRows(rows, sourceDay) {
  if (!Array.isArray(rows)) throw new Error("API вернул неожиданный формат данных.");
  const latest = new Map();
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const id = typeof row.link_id === "string" ? row.link_id.trim() : "";
    const observedAt = timestamp(row.data_as_of);
    if (!id || !observedAt || observedAt.slice(0, 10) !== sourceDay) continue;
    if (!latest.has(id) || latest.get(id).observedAt < observedAt) {
      latest.set(id, { row, observedAt });
    }
  }
  return [...latest.entries()].flatMap(([id, { row, observedAt }]) => {
    const speedMph = number(row.speed);
    const travelSeconds = number(row.travel_time);
    const position = parsePosition(row.link_points);
    // Ошибка датчика и нулевое время проезда не означают пробку.
    if (number(row.status) !== 0 || speedMph === null || speedMph < 0 || speedMph > 130
        || travelSeconds === null || travelSeconds <= 0 || !position) return [];
    const speedKmh = speedMph * 1.609344;
    const name = typeof row.link_name === "string" && row.link_name.trim()
      ? row.link_name.trim() : `Участок ${id}`;
    return [{
      id, name, position, speedKmh, travelSeconds, observedAt,
      borough: typeof row.borough === "string" ? row.borough : "Нью-Йорк",
      level: classifySpeed(speedKmh)
    }];
  });
}
