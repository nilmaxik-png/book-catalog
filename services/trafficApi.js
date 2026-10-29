import { MOSCOW_ROADS } from "../domain/mapRegion.js";
import { normalizeTrafficMatrix } from "../domain/traffic.js";

export const SOURCE_URL = "https://api.1traffic.ru/v2/";
// Общедоступный учебный ключ из официальной документации. Лимит: 1 запрос/с.
export const API_ENDPOINT = "https://api.1traffic.ru/v2/matrix?key=demo&traffic=1";

export function buildTrafficRequest(roads = MOSCOW_ROADS) {
  const point = ([lat, lon]) => ({ lat, lon });
  return JSON.stringify({
    sources: roads.map(road => point(road.start)),
    targets: roads.map(road => point(road.end))
  });
}

function aborted() {
  return Object.assign(new Error("Запрос отменён."), { name: "AbortError" });
}

export async function fetchTraffic({ fetchImpl = globalThis.fetch, signal, timeoutMs = 20000 } = {}) {
  if (signal?.aborted) throw aborted();
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const response = await fetchImpl(API_ENDPOINT, {
      method: "POST",
      // JSON с этим типом принимается API без предварительного OPTIONS,
      // который сервер не поддерживает. Запрос работает и в браузере.
      headers: { Accept: "application/json", "Content-Type": "text/plain;charset=UTF-8" },
      body: buildTrafficRequest(), signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(response.status === 429
        ? "Учебный API временно занят. Повторите обновление через несколько секунд."
        : `Источник данных недоступен (HTTP ${response.status}). Попробуйте ещё раз.`);
    }
    let data;
    try { data = await response.json(); }
    catch { throw new Error("Источник вернул ответ, который не удалось прочитать."); }
    if (signal?.aborted) throw aborted();
    const segments = normalizeTrafficMatrix(data, MOSCOW_ROADS);
    if (!segments.length) throw new Error("API не вернул время проезда по московским участкам. Попробуйте обновить позже.");
    return { segments, receivedAt: new Date().toISOString() };
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
