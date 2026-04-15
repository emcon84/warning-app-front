"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Comercio, ComercioOffer } from "../../types";
import Navbar from "../../components/Navbar";
import { MapPin, Clock, Phone, X } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Props {
  comercio: Comercio;
}

const RUBRO_COLORS: Record<string, string> = {
  "Almacén/Despensa":   "bg-amber-900/40 text-amber-400 border-amber-800",
  "Restaurante/Comida": "bg-orange-900/40 text-orange-400 border-orange-800",
  "Indumentaria":       "bg-pink-900/40 text-pink-400 border-pink-800",
  "Calzado":            "bg-rose-900/40 text-rose-400 border-rose-800",
  "Electrónica":        "bg-blue-900/40 text-blue-400 border-blue-800",
  "Ferretería":         "bg-zinc-800/60 text-zinc-400 border-zinc-700",
  "Farmacia":           "bg-green-900/40 text-green-400 border-green-800",
  "Peluquería/Estética":"bg-purple-900/40 text-purple-400 border-purple-800",
  "Librería/Papelería": "bg-cyan-900/40 text-cyan-400 border-cyan-800",
  "Veterinaria":        "bg-teal-900/40 text-teal-400 border-teal-800",
  "Deportes":           "bg-lime-900/40 text-lime-400 border-lime-800",
  "Mueblería":          "bg-yellow-900/40 text-yellow-500 border-yellow-800",
  "Joyería/Relojería":  "bg-yellow-900/40 text-yellow-400 border-yellow-800",
  "Otro":               "bg-gray-800 text-gray-400 border-gray-700",
};

const RUBRO_COLORS_LIGHT: Record<string, string> = {
  "Almacén/Despensa":   "bg-amber-100 text-amber-700 border-amber-300",
  "Restaurante/Comida": "bg-orange-100 text-orange-700 border-orange-300",
  "Indumentaria":       "bg-pink-100 text-pink-700 border-pink-300",
  "Calzado":            "bg-rose-100 text-rose-700 border-rose-300",
  "Electrónica":        "bg-blue-100 text-blue-700 border-blue-300",
  "Ferretería":         "bg-gray-100 text-gray-600 border-gray-300",
  "Farmacia":           "bg-green-100 text-green-700 border-green-300",
  "Peluquería/Estética":"bg-purple-100 text-purple-700 border-purple-300",
  "Librería/Papelería": "bg-cyan-100 text-cyan-700 border-cyan-300",
  "Veterinaria":        "bg-teal-100 text-teal-700 border-teal-300",
  "Deportes":           "bg-lime-100 text-lime-700 border-lime-300",
  "Mueblería":          "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Joyería/Relojería":  "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Otro":               "bg-gray-100 text-gray-600 border-gray-300",
};

function photoUrl(url: string): string {
  if (!url) return url;
  return url.startsWith("/uploads/") ? `${API}${url}` : url;
}

export default function ComercioProfileClient({ comercio }: Props) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    setIsDark(stored !== "light");

    function onStorage(e: StorageEvent) {
      if (e.key === "theme") setIsDark(e.newValue !== "light");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const bg          = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSec     = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted   = isDark ? "text-gray-500" : "text-gray-400";
  const cardBg      = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const tagBg       = isDark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-100 border-gray-200 text-gray-600";

  const rubroBadge = isDark
    ? (RUBRO_COLORS[comercio.rubro] || RUBRO_COLORS["Otro"])
    : (RUBRO_COLORS_LIGHT[comercio.rubro] || RUBRO_COLORS_LIGHT["Otro"]);

  const waText = encodeURIComponent("Hola, te contacto desde Reportes Reconquista");
  const waUrl  = `https://wa.me/${comercio.whatsapp}?text=${waText}`;

  const activeOffers = (comercio.offers || []).filter((o) => o.activa);

  return (
    <div className={`min-h-screen ${bg} ${textPrimary} flex flex-col`}>
      <Navbar sidebarDisabled />

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            onClick={() => setLightboxSrc(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxSrc}
            alt="Foto del comercio"
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="flex-1 max-w-xl mx-auto w-full px-4 pt-20 pb-24">

        {/* Volver */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-1.5 text-sm mb-5 transition-colors ${textSec}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className={`p-5 rounded-2xl border mb-4 ${cardBg}`}>
          <div className="flex items-start gap-4">
            {/* Logo / avatar */}
            <div className={`w-20 h-20 rounded-full flex-shrink-0 overflow-hidden border-2 ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-100"}`}>
              {comercio.foto ? (
                <img
                  src={photoUrl(comercio.foto)}
                  alt={comercio.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${textMuted}`}>
                  {comercio.nombre[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className={`text-xl font-bold leading-tight ${textPrimary}`}>{comercio.nombre}</h1>
              <span className={`inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full border font-medium ${rubroBadge}`}>
                {comercio.rubro}
              </span>

              <div className="flex flex-col gap-1 mt-3">
                <div className="flex items-center gap-2">
                  <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${textMuted}`} />
                  <span className={`text-sm ${textSec}`}>{comercio.barrio}, Reconquista</span>
                </div>
                {comercio.direccion && (
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${textMuted}`} />
                    <span className={`text-sm ${textSec}`}>{comercio.direccion}</span>
                  </div>
                )}
                {comercio.horario && (
                  <div className="flex items-start gap-2">
                    <Clock className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${textMuted}`} />
                    <span className={`text-sm ${textSec}`}>{comercio.horario}</span>
                  </div>
                )}
                {comercio.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className={`w-3.5 h-3.5 flex-shrink-0 ${textMuted}`} />
                    <span className={`text-sm ${textSec}`}>{comercio.telefono}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Descripcion */}
          {comercio.descripcion && (
            <p className={`mt-4 text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {comercio.descripcion}
            </p>
          )}

          {/* Boton WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm text-white transition-colors"
            style={{ backgroundColor: "#25D366" }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contactar por WhatsApp
          </a>
        </div>

        {/* ── Galeria ─────────────────────────────────────────────────── */}
        {comercio.fotos && comercio.fotos.length > 0 && (
          <div className="mb-4">
            <p className={`text-sm font-medium mb-2 ${textSec}`}>Fotos del local</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {comercio.fotos.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxSrc(photoUrl(url))}
                  className={`aspect-square rounded-xl overflow-hidden border focus:outline-none ${isDark ? "border-gray-800" : "border-gray-200"}`}
                >
                  <img
                    src={photoUrl(url)}
                    alt={`Foto ${i + 1}`}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Ofertas ─────────────────────────────────────────────────── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Ofertas activas{activeOffers.length > 0 ? ` (${activeOffers.length})` : ""}
            </p>
          </div>

          {activeOffers.length === 0 ? (
            <div className={`py-8 text-center rounded-2xl border ${cardBg}`}>
              <p className={`text-sm ${textMuted}`}>No hay ofertas activas por ahora.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeOffers.map((offer) => (
                <OfertaCard
                  key={offer.id}
                  offer={offer}
                  whatsapp={comercio.whatsapp}
                  isDark={isDark}
                  cardBg={cardBg}
                  textPrimary={textPrimary}
                  textSec={textSec}
                  textMuted={textMuted}
                  tagBg={tagBg}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Oferta Card ─────────────────────────────────────────────────────────────

function OfertaCard({
  offer,
  whatsapp,
  isDark,
  cardBg,
  textPrimary,
  textSec,
  textMuted,
}: {
  offer: ComercioOffer;
  whatsapp: string;
  isDark: boolean;
  cardBg: string;
  textPrimary: string;
  textSec: string;
  textMuted: string;
  tagBg: string;
}) {
  const waText = encodeURIComponent(`Hola! Te consulto por la oferta: ${offer.titulo}`);
  const waUrl  = `https://wa.me/${whatsapp}?text=${waText}`;

  const validaHasta = offer.validaHasta
    ? new Date(offer.validaHasta).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
      <div className="flex gap-0">
        {/* Foto de la oferta */}
        {offer.foto && (
          <div className="w-28 h-28 flex-shrink-0">
            <img
              src={photoUrl(offer.foto)}
              alt={offer.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Datos */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <p className={`font-semibold text-sm leading-snug ${textPrimary}`}>{offer.titulo}</p>
            {offer.descripcion && (
              <p className={`text-xs mt-1 leading-relaxed ${textSec}`}>{offer.descripcion}</p>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {offer.precio && (
                <span className={`text-base font-bold px-2.5 py-0.5 rounded-xl border ${
                  isDark
                    ? "bg-yellow-400/10 text-yellow-300 border-yellow-700"
                    : "bg-yellow-50 text-yellow-700 border-yellow-300"
                }`}>
                  {offer.precio}
                </span>
              )}
              {validaHasta && (
                <span className={`text-xs ${textMuted}`}>
                  Hasta el {validaHasta}
                </span>
              )}
            </div>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-colors"
            style={{ backgroundColor: "#25D366" }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
