"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Comercio, ComercioOffer } from "../../types";
import Navbar from "../../components/Navbar";
import { useTheme } from "../../contexts/ThemeContext";
import { MapPin, Clock, Phone, X, Pencil } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Props {
  comercio: Comercio;
  isOwner?: boolean;
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

// Colores de fondo para gradiente cuando no hay foto
const RUBRO_GRADIENT: Record<string, string> = {
  "Almacén/Despensa":   "from-amber-950 to-amber-800",
  "Restaurante/Comida": "from-orange-950 to-orange-800",
  "Indumentaria":       "from-pink-950 to-pink-800",
  "Calzado":            "from-rose-950 to-rose-800",
  "Electrónica":        "from-blue-950 to-blue-800",
  "Ferretería":         "from-zinc-900 to-zinc-700",
  "Farmacia":           "from-green-950 to-green-800",
  "Peluquería/Estética":"from-purple-950 to-purple-800",
  "Librería/Papelería": "from-cyan-950 to-cyan-800",
  "Veterinaria":        "from-teal-950 to-teal-800",
  "Deportes":           "from-lime-950 to-lime-800",
  "Mueblería":          "from-yellow-950 to-yellow-800",
  "Joyería/Relojería":  "from-yellow-950 to-yellow-800",
  "Otro":               "from-gray-900 to-gray-700",
};

function photoUrl(url: string): string {
  if (!url) return url;
  return url.startsWith("/uploads/") ? `${API}${url}` : url;
}

const WaIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ComercioProfileClient({ comercio, isOwner }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const bg          = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSec     = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted   = isDark ? "text-gray-500" : "text-gray-400";
  const cardBg      = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const tagBg       = isDark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-100 border-gray-200 text-gray-600";

  const rubroBadge = isDark
    ? (RUBRO_COLORS[comercio.rubro] || RUBRO_COLORS["Otro"])
    : (RUBRO_COLORS_LIGHT[comercio.rubro] || RUBRO_COLORS_LIGHT["Otro"]);

  const heroGradient = RUBRO_GRADIENT[comercio.rubro] || RUBRO_GRADIENT["Otro"];

  const waText = encodeURIComponent("Hola, te contacto desde Reportes Reconquista");
  const waUrl  = `https://wa.me/${comercio.whatsapp}?text=${waText}`;

  const activeOffers = (comercio.offers || []).filter((o) => o.activa);

  // Galeria: si no hay fotos adicionales pero hay foto principal, mostrarla
  const galeriaFotos = comercio.fotos && comercio.fotos.length > 0
    ? comercio.fotos
    : (comercio.foto ? [comercio.foto] : []);

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

      <div className="flex-1 max-w-xl mx-auto w-full pb-28">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          {comercio.foto ? (
            <img
              src={photoUrl(comercio.foto)}
              alt={comercio.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${heroGradient} flex items-center justify-center`}>
              <span className="text-7xl font-black text-white/20 select-none">
                {comercio.rubro.split("/")[0].slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          {/* Gradiente bottom-to-top suave */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Volver */}
          <button
            onClick={() => router.back()}
            className="absolute top-14 left-4 flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
        </div>

        {/* ── Info card ─────────────────────────────────────────────── */}
        <div className={`mx-4 rounded-2xl border ${cardBg} overflow-visible -mt-4`}>
          {/* Avatar + nombre en la misma fila, avatar sobresale del hero */}
          <div className="relative px-5 pt-0">
            <div className="flex items-end gap-3 -mt-10 mb-4">
              <div className={`w-20 h-20 rounded-full overflow-hidden border-4 flex-shrink-0 ${isDark ? "border-gray-900 bg-gray-800" : "border-white bg-gray-100"}`}>
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
              {/* Nombre y badge a la derecha del avatar, alineados al bottom */}
              <div className="pb-1 min-w-0">
                <h1 className={`text-lg font-black leading-tight truncate ${textPrimary}`}>{comercio.nombre}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${rubroBadge}`}>
                    {comercio.rubro}
                  </span>
                  {comercio.barrio && (
                    <span className={`flex items-center gap-1 text-xs ${textMuted}`}>
                      <MapPin className="w-3 h-3" />
                      {comercio.barrio}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 pb-5">
            {/* Info en row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              {comercio.direccion && (
                <span className={`flex items-center gap-1.5 ${textSec}`}>
                  <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${textMuted}`} />
                  {comercio.direccion}
                </span>
              )}
              {comercio.horario && (
                <span className={`flex items-center gap-1.5 ${textSec}`}>
                  <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${textMuted}`} />
                  {comercio.horario}
                </span>
              )}
              {comercio.telefono && (
                <span className={`flex items-center gap-1.5 ${textSec}`}>
                  <Phone className={`w-3.5 h-3.5 flex-shrink-0 ${textMuted}`} />
                  {comercio.telefono}
                </span>
              )}
            </div>

            {/* Descripcion */}
            {comercio.descripcion && (
              <div className={`mt-4 px-3 py-3 rounded-xl text-sm leading-relaxed ${isDark ? "bg-gray-800/60 text-gray-300" : "bg-gray-50 text-gray-700"}`}>
                {comercio.descripcion}
              </div>
            )}

            {/* Boton WhatsApp — siempre inline, no fixed */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#25D366" }}
            >
              <WaIcon />
              Contactar por WhatsApp
            </a>

            {isOwner && (
              <button
                onClick={() => router.push("/comercio/gestionar")}
                className={`mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm border transition-colors ${
                  isDark
                    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Pencil className="w-4 h-4" />
                Gestionar mi comercio
              </button>
            )}
          </div>
        </div>

        {/* ── Galeria ─────────────────────────────────────────────────── */}
        {galeriaFotos.length > 0 && (
          <div className="mx-4 mt-4">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2.5 ${textMuted}`}>
              Fotos del local
            </p>
            <div className="grid grid-cols-3 gap-2">
              {galeriaFotos.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxSrc(photoUrl(url))}
                  className={`aspect-square rounded-xl overflow-hidden border focus:outline-none group ${isDark ? "border-gray-800" : "border-gray-200"}`}
                >
                  <img
                    src={photoUrl(url)}
                    alt={`Foto ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Ofertas ─────────────────────────────────────────────────── */}
        <div className="mx-4 mt-4 mb-4">
          <div className="mb-3">
            <p className={`text-base font-bold ${textPrimary}`}>
              Ofertas activas
              {activeOffers.length > 0 && (
                <span className={`ml-2 text-sm font-normal ${textMuted}`}>({activeOffers.length})</span>
              )}
            </p>
            <p className={`text-xs mt-0.5 ${textMuted}`}>Productos y promociones disponibles ahora</p>
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
        {/* Foto de la oferta - 1/3 del card */}
        {offer.foto && (
          <div className="w-1/3 min-h-[120px] flex-shrink-0">
            <img
              src={photoUrl(offer.foto)}
              alt={offer.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Datos - 2/3 o full si no hay foto */}
        <div className={`flex-1 p-4 flex flex-col justify-between min-w-0 ${offer.foto ? "" : "w-full"}`}>
          <div>
            <p className={`font-bold text-sm leading-snug ${textPrimary}`}>{offer.titulo}</p>
            {offer.descripcion && (
              <p className={`text-xs mt-1.5 leading-relaxed ${textSec}`}>{offer.descripcion}</p>
            )}

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {offer.precio && (
                <span className={`text-lg font-black px-3 py-1 rounded-xl border ${
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
            className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
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
