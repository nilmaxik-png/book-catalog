import React, { useEffect, useRef } from "react";
import { MAP_HTML } from "../map/mapDocument";

const channel = "moscow-traffic-map";

export default function TrafficMap({ segments, selectedId, onSelect }) {
  const frame = useRef(null);
  const latest = useRef({ segments, selectedId, onSelect });
  latest.current = { segments, selectedId, onSelect };

  function update() {
    frame.current?.contentWindow?.postMessage({ channel, type: "update",
      segments: latest.current.segments, selectedId: latest.current.selectedId }, "*");
  }
  useEffect(() => {
    function receive(event) {
      if (event.source !== frame.current?.contentWindow || event.data?.channel !== channel) return;
      if (event.data.type === "ready") update();
      if (event.data.type === "select" && latest.current.segments.some(road => road.id === event.data.id)) {
        latest.current.onSelect(event.data.id);
      }
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(update, [segments, selectedId]);

  return <iframe ref={frame} srcDoc={MAP_HTML} title="Карта дорожной обстановки Москвы"
    onLoad={update} style={{ width: "100%", height: "100%", position: "absolute", border: 0 }} />;
}
