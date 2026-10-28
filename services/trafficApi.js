import { getNewYorkDay, normalizeTrafficRows } from "../domain/traffic.js";

export const SOURCE_URL = "https://data.cityofnewyork.us/Transportation/DOT-Traffic-Speeds/i4gi-tjb9";
export const API_ENDPOINT = "https://data.cityofnewyork.us/resource/i4gi-tjb9.json";

export function buildTrafficUrl(now = new Date()) {
  const sourceDay = getNewYorkDay(now);
  const params = new URLSearchParams({
    "$select": "link_id,link_name,borough,speed,travel_time,status,data_as_of,link_points",
    "$where": `data_as_of >= '${sourceDay}T00:00:00'`,
    "$order": "data_as_of DESC,link_id ASC",
    "$limit": "500"
  });
  return `${API_ENDPOINT}?${params.toString()}`;
}

function aborted() {
  return Object.assign(new Error("Запрос отменён."), { name: "AbortError" });
}

export async function fetchTraffic({ fetchImpl = globalThis.fetch, signal, now = new Date(), timeoutMs = 20000 } = {}) {
  if (signal?.aborted) throw aborted();
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const response = await fetchImpl(buildTrafficUrl(now), {
      headers: { Accept: "application/json" }, signal: controller.signal, cache: "no-store"
    });
    if (!response.ok) {
      const hint = response.status === 429 ? "Слишком много запросов. Повторите немного позже."
        : `Источник данных недоступен (HTTP ${response.status}). Попробуйте ещё раз.`;
      throw new Error(hint);
    }
    let rows;
    try { rows = await response.json(); }
    catch { throw new Error("Источник вернул ответ, который не удалось прочитать."); }
    if (signal?.aborted) throw aborted();
    const sourceDay = getNewYorkDay(now);
    const segments = normalizeTrafficRows(rows, sourceDay);
    if (!segments.length) {
      throw new Error("Нет корректных измерений за сегодняшний день в Нью-Йорке. Обновите данные позже.");
    }
    return {
      segments, sourceDay, receivedAt: new Date().toISOString(),
      newestObservation: segments.reduce((latest, segment) => segment.observedAt > latest ? segment.observedAt : latest, "")
    };
  } catch (error) {
    if (signal?.aborted) throw aborted();
    if (timedOut) throw new Error("Источник не ответил за 20 секунд. Проверьте интернет и повторите обновление.");
    if (error instanceof TypeError) throw new Error("Не удалось связаться с API. Проверьте подключение к интернету.");
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}
