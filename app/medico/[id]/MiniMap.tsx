"use client";

import { useEffect, useRef } from "react";

interface Props {
  lat?: number | null;
  lng?: number | null;
  nombre: string;
  isDark: boolean;
  editable?: boolean;
  onPositionChange?: (lat: number, lng: number) => void;
}

// Centro de Reconquista como fallback
const DEFAULT_LAT = -29.145;
const DEFAULT_LNG = -59.655;

export default function MiniMap({ lat, lng, nombre, isDark, editable, onPositionChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      // Guard contra double-init (Strict Mode / Fast Refresh)
      const container = containerRef.current as any;
      if (container._leaflet_id) {
        container._leaflet_id = undefined;
      }

      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const centerLat = lat ?? DEFAULT_LAT;
      const centerLng = lng ?? DEFAULT_LNG;

      const tile = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

      const map = L.map(containerRef.current!, {
        center: [centerLat, centerLng],
        zoom: lat && lng ? 16 : 13,
        zoomControl: true,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: !editable,
        touchZoom: true,
      });

      L.tileLayer(tile, { maxZoom: 19 }).addTo(map);

      const icon = L.divIcon({
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:${editable ? "#8b5cf6" : "#3b82f6"};border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;
          cursor:${editable ? "grab" : "default"};
        ">
          <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
            <path d="M19 10c0 6-7 12-7 12S5 16 5 10a7 7 0 0 1 14 0z"/>
            <circle cx="12" cy="10" r="2.5" fill="white"/>
          </svg>
        </div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      if (lat && lng) {
        const marker = L.marker([lat, lng], { icon, draggable: !!editable }).addTo(map);
        if (!editable) marker.bindPopup(`Dr/a. ${nombre}`);
        if (editable) {
          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onPositionChange?.(pos.lat, pos.lng);
          });
        }
        markerRef.current = marker;
      }

      if (editable) {
        map.on("click", (e: any) => {
          const { lat: newLat, lng: newLng } = e.latlng;
          if (markerRef.current) {
            markerRef.current.setLatLng([newLat, newLng]);
          } else {
            const m = L.marker([newLat, newLng], { icon, draggable: true }).addTo(map);
            m.on("dragend", () => {
              const pos = m.getLatLng();
              onPositionChange?.(pos.lat, pos.lng);
            });
            markerRef.current = m;
          }
          onPositionChange?.(newLat, newLng);
        });
      }

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Mover el pin externamente (desde geocoding o GPS)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (lat && lng) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], 16, { animate: true });
    }
  }, [lat, lng]);

  return <div ref={containerRef} className="w-full h-full" />;
}
