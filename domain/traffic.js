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

export function normalizeTrafficMatrix(data, roads) {
  if (!data || !Array.isArray(data.sources_to_targets)) {
    throw new Error("API вернул неожиданный формат данных.");
  }
  return roads.flatMap((road, index) => {
    const row = data.sources_to_targets[index];
    if (!Array.isArray(row)) return [];
    // Берём только start/end одной дороги, а не соседнюю ячейку матрицы.
    const matches = row.filter(cell => cell && number(cell.from_index) === index && number(cell.to_index) === index);
    if (matches.length !== 1) return [];
    const distanceKm = number(matches[0].distance);
    const travelSeconds = number(matches[0].time);
    if (distanceKm === null || distanceKm <= 0 || travelSeconds === null || travelSeconds <= 0) return [];
    const speedKmh = distanceKm * 3600 / travelSeconds;
    if (!Number.isFinite(speedKmh) || speedKmh > 200) return [];
    return [{
      id: road.id, name: road.name, position: road.position, borough: "Москва",
      start: road.start, end: road.end, distanceKm, travelSeconds, speedKmh,
      level: classifySpeed(speedKmh)
    }];
  });
}

export function formatReceivedTime(value) {
  return new Date(value).toLocaleString("ru-RU", { timeZone: "Europe/Moscow", hour12: false });
}
