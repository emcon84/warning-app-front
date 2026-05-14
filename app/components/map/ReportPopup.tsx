"use client";

import Image from "next/image";
import { Share2, Phone, AlertTriangle } from "lucide-react";
import { getCategoryLabel, getCategoryIcon } from "../../utils/categoryHelpers";
import type { Report } from "../../types";

const PUBLIC_SERVICE_CATEGORIES = [
  "basura", "alumbrado", "pastizales", "fugas_agua",
  "drenaje", "limpieza", "escombros", "baches", "banquetas",
];

const PUBLIC_SERVICE_LABELS: Record<string, string> = {
  basura: "Basura sin recolectar",
  alumbrado: "Problema de alumbrado público",
  pastizales: "Pastizales altos",
  fugas_agua: "Fuga de agua",
  drenaje: "Problema de drenaje",
  limpieza: "Falta de limpieza",
  escombros: "Escombros",
  baches: "Baches",
  banquetas: "Banquetas dañadas",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface Props {
  report: Report;
}

export function ReportPopup({ report }: Props) {
  const photos = report.photos || (report.photo ? [report.photo] : []);
  const Icon = getCategoryIcon(report.category);

  function handleShareRobo() {
    const message = `🚨 *ALERTA DE ROBO EN EJECUCIÓN*\n\n⚠️ *URGENTE - Reconquista, Santa Fe*\n\n📝 *Descripción:* ${report.description}\n\n📍 *Ubicación:*\n• Barrio: ${report.barrio}\n• Dirección: ${report.direccion}\n\n🗺️ Ver ubicación exacta: https://www.google.com/maps?q=${report.lat},${report.lng}\n\n📅 *Reportado:* ${formatDate(report.createdAt)}\n\n🌐 *Reporta incidentes en:* https://reportesreconquista.com`;
    window.open(`https://wa.me/5493482730030?text=${encodeURIComponent(message)}`, "_blank");
  }

  function handleSharePublicService() {
    const message = `🏛️ *RECLAMO DE SERVICIOS PÚBLICOS*\n\n📋 *Tipo de Reclamo:* ${PUBLIC_SERVICE_LABELS[report.category] || report.category}\n\n📝 *Descripción:* ${report.description}\n\n📍 *Ubicación:*\n• Barrio: ${report.barrio}\n• Dirección: ${report.direccion}\n\n🗺️ Ver ubicación: https://www.google.com/maps?q=${report.lat},${report.lng}\n\n📅 *Fecha:* ${formatDate(report.createdAt)}\n\n🌐 *Reporta incidentes en:* https://reportesreconquista.com`;
    window.open(`https://wa.me/5493482519279?text=${encodeURIComponent(message)}`, "_blank");
  }

  function handleShare() {
    const message = `🚨 *Reporte Ciudadano - Reconquista*\n\n📌 *Categoría:* ${getCategoryLabel(report.category)}\n📝 *Descripción:* ${report.description}\n\n📍 *Ubicación:*\n• Barrio: ${report.barrio}\n• Dirección: ${report.direccion}\n\n📅 *Fecha:* ${formatDate(report.createdAt)}\n\n🗺️ Ver en mapa: https://www.google.com/maps?q=${report.lat},${report.lng}\n\n🌐 *Reporta incidentes en:* https://reportesreconquista.com`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <div className="text-sm">
      {photos.length > 0 && (
        <div className="relative w-full h-24 mb-2 rounded overflow-hidden">
          <Image src={photos[0]} alt="Foto" fill className="object-cover" unoptimized />
          {photos.length > 1 && (
            <div className="absolute top-1 right-1 bg-black/60 text-white px-2 py-0.5 rounded text-xs">
              +{photos.length - 1}
            </div>
          )}
        </div>
      )}

      <div className="mb-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold bg-gray-100">
          <Icon className="w-3 h-3" />
          {getCategoryLabel(report.category)}
        </span>
      </div>

      <p className="font-semibold text-base mb-1">{report.description}</p>

      <div className="text-xs text-gray-600 space-y-1">
        <p className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <strong>Barrio:</strong> {report.barrio}
        </p>
        <p className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <strong>Dirección:</strong> {report.direccion}
        </p>
        <p className="text-gray-500 mt-1">{new Date(report.createdAt).toLocaleString("es-AR")}</p>
      </div>

      {report.category === "robo" && report.isUrgent && (
        <div className="mt-3 p-2 bg-red-50 border border-red-300 rounded">
          <div className="flex items-center gap-1 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-red-900">ROBO EN EJECUCIÓN</span>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => { window.location.href = "tel:911"; }}
              className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 flex items-center justify-center gap-1"
            >
              <Phone className="w-3 h-3" /> Llamar al 911
            </button>
            <button
              onClick={handleShareRobo}
              className="w-full px-3 py-1.5 bg-orange-600 text-white rounded text-xs font-semibold hover:bg-orange-700 flex items-center justify-center gap-1"
            >
              <Share2 className="w-3 h-3" /> Avisar a Ojos en Alerta
            </button>
          </div>
        </div>
      )}

      {PUBLIC_SERVICE_CATEGORIES.includes(report.category) && (
        <button
          onClick={handleSharePublicService}
          className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 flex items-center justify-center gap-1"
        >
          <Share2 className="w-3 h-3" /> Reclamo a Servicios Públicos
        </button>
      )}

      <button
        onClick={handleShare}
        className="w-full mt-2 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 flex items-center justify-center gap-1"
      >
        <Share2 className="w-3 h-3" /> Compartir
      </button>
    </div>
  );
}
