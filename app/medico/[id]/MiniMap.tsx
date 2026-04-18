"use client";

import { useEffect, useRef } from "react";

interface Props {
  lat: number;
  lng: number;
  nombre: string;
  isDark: boolean;
}

export default function MiniMap({ lat, lng, nombre, isDark }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      // Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const tile = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

      const map = L.map(containerRef.current!, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      });

      L.tileLayer(tile, { maxZoom: 19 }).addTo(map);

      const icon = L.divIcon({
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:#3b82f6;border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;
        ">
          <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
            <path d="M19 10c0 6-7 12-7 12S5 16 5 10a7 7 0 0 1 14 0z"/>
            <circle cx="12" cy="10" r="2.5" fill="white"/>
          </svg>
        </div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([lat, lng], { icon }).addTo(map).bindPopup(`Dr/a. ${nombre}`);

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, nombre, isDark]);

  return <div ref={containerRef} className="w-full h-full" />;
}
