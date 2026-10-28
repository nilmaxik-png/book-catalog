import { useCallback, useEffect, useRef, useState } from "react";
import { fetchTraffic } from "../services/trafficApi";

const EMPTY_SEGMENTS = [];

export function useTraffic() {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mounted = useRef(false);
  const activeRequest = useRef(null);

  const refresh = useCallback(async () => {
    if (!mounted.current || activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setError("");
    try {
      const next = await fetchTraffic({ signal: controller.signal });
      if (mounted.current && !controller.signal.aborted) setSnapshot(next);
    } catch (cause) {
      if (mounted.current && cause.name !== "AbortError") setError(cause.message || "Не удалось обновить данные.");
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        if (mounted.current) setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    return () => {
      mounted.current = false;
      activeRequest.current?.abort();
      activeRequest.current = null;
    };
  }, [refresh]);

  return { segments: snapshot?.segments ?? EMPTY_SEGMENTS, snapshot, loading, error, refresh };
}
