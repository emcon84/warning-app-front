"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { Doctor } from "../../types";
import { createDoctorIcon, createRelocateIcon } from "./map-icons";

interface DoctorClusterLayerProps {
  doctors: Doctor[];
  relocatingDoctorId: string | null | undefined;
  onDoctorClick?: (doctor: Doctor) => void;
  onDoctorRelocated?: (doctorId: string, lat: number, lng: number) => void;
}

export function DoctorClusterLayer({
  doctors,
  relocatingDoctorId,
  onDoctorClick,
  onDoctorRelocated,
}: DoctorClusterLayerProps) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const clusterGroup = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="
            background: #16a34a; color: white; border-radius: 50%;
            width: 38px; height: 38px;
            display: flex; align-items: center; justify-content: center;
            font-size: 13px; font-weight: 700;
            border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">${count}</div>`,
          className: "",
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });
      },
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);
    return () => { map.removeLayer(clusterGroup); };
  }, [map]);

  useEffect(() => {
    const clusterGroup = clusterGroupRef.current;
    if (!clusterGroup) return;

    clusterGroup.clearLayers();

    doctors.forEach((doctor) => {
      const isRelocating = relocatingDoctorId === doctor.id;
      const marker = L.marker([doctor.lat, doctor.lng], {
        icon: isRelocating ? createRelocateIcon() : createDoctorIcon(doctor),
        draggable: isRelocating,
      });

      if (!isRelocating) {
        const popup = L.popup({ closeButton: false, autoPan: false }).setContent(`
          <div style="min-width:150px;font-family:sans-serif;pointer-events:none">
            <p style="font-weight:700;font-size:13px;margin:0 0 2px">${doctor.nombre}</p>
            <p style="color:#6b7280;font-size:11px;margin:0 0 2px">${doctor.especialidad}</p>
            ${doctor.direccion ? `<p style="color:#9ca3af;font-size:11px;margin:0 0 6px">${doctor.direccion}</p>` : "<div style='margin-bottom:6px'></div>"}
            <p style="color:#16a34a;font-size:10px;margin:0;font-weight:600">Tocá para ver info completa</p>
          </div>
        `);
        marker.bindPopup(popup);
        marker.on("mouseover", () => marker.openPopup());
        marker.on("mouseout", () => marker.closePopup());
        marker.on("click", () => { marker.closePopup(); onDoctorClick?.(doctor); });
      }

      if (isRelocating) {
        marker.on("dragend", (e) => {
          const { lat, lng } = e.target.getLatLng();
          onDoctorRelocated?.(doctor.id, lat, lng);
        });
      }

      clusterGroup.addLayer(marker);
    });
  }, [doctors, relocatingDoctorId, onDoctorClick, onDoctorRelocated]);

  return null;
}
