import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map.web.css";
import { NEW_YORK_REGION } from "../domain/mapRegion";

export default function TrafficMap({ segments, selectedId, onSelect }) {
  const container = useRef(null);
  const map = useRef(null);
  const markers = useRef(null);
  const fitted = useRef(false);

  useEffect(() => {
    const instance = L.map(container.current).setView([
      NEW_YORK_REGION.latitude, NEW_YORK_REGION.longitude
    ], 10);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(instance);
    map.current = instance;
    markers.current = L.layerGroup().addTo(instance);
    const resize = () => instance.invalidateSize();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    observer?.observe(container.current);
    window.addEventListener("resize", resize);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      instance.remove();
      map.current = null;
      markers.current = null;
      fitted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !markers.current) return;
    markers.current.clearLayers();
    for (const segment of segments) {
      const point = document.createElement("span");
      point.className = `traffic-dot${selectedId === segment.id ? " traffic-dot-selected" : ""}`;
      point.style.backgroundColor = segment.level.color;
      const icon = L.divIcon({ html: point, className: "traffic-marker", iconSize: [24, 24], iconAnchor: [12, 12] });
      L.marker([segment.position.latitude, segment.position.longitude], {
        icon, keyboard: true, title: `${segment.name}: ${segment.level.label}`
      }).on("click", () => onSelect(segment.id)).addTo(markers.current);
    }
    if (segments.length && !fitted.current) {
      map.current.fitBounds(segments.map(segment => [segment.position.latitude, segment.position.longitude]), {
        padding: [24, 24], maxZoom: 12
      });
      fitted.current = true;
    }
  }, [segments, selectedId, onSelect]);

  return <div ref={container} className="traffic-map" aria-label="Карта дорожной обстановки Нью-Йорка" />;
}
