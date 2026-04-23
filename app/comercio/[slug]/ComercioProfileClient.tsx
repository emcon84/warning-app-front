"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Comercio, ComercioOffer, Producto } from "../../types";
import Navbar from "../../components/Navbar";
import { useTheme } from "../../contexts/ThemeContext";
import { MapPin, Clock, Phone, X, Pencil, Share2, ChevronLeft, ChevronRight, Copy, Check, MessageCircle, ShoppingBag } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Props {
  comercio: Comercio;
  isOwner?: boolean;
}

const RUBRO_COLORS: Record<string, string> = {
  "Almacén/Despensa":          "bg-amber-900/40 text-amber-400 border-amber-800",
  "Restaurante/Comida":        "bg-orange-900/40 text-orange-400 border-orange-800",
  "Indumentaria":              "bg-pink-900/40 text-pink-400 border-pink-800",
  "Calzado":                   "bg-rose-900/40 text-rose-400 border-rose-800",
  "Electrónica":               "bg-blue-900/40 text-blue-400 border-blue-800",
  "Tecnología/Informática":    "bg-sky-900/40 text-sky-400 border-sky-800",
  "Ferretería":                "bg-zinc-800/60 text-zinc-400 border-zinc-700",
  "Materiales/Construcción":   "bg-stone-800/60 text-stone-400 border-stone-700",
  "Farmacia":                  "bg-green-900/40 text-green-400 border-green-800",
  "Salud/Bienestar":           "bg-emerald-900/40 text-emerald-400 border-emerald-800",
  "Peluquería/Estética":       "bg-purple-900/40 text-purple-400 border-purple-800",
  "Librería/Papelería":        "bg-cyan-900/40 text-cyan-400 border-cyan-800",
  "Veterinaria":               "bg-teal-900/40 text-teal-400 border-teal-800",
  "Deportes":                  "bg-lime-900/40 text-lime-400 border-lime-800",
  "Mueblería":                 "bg-yellow-900/40 text-yellow-500 border-yellow-800",
  "Joyería/Relojería":         "bg-yellow-900/40 text-yellow-400 border-yellow-800",
  "Automotriz/Mecánica":       "bg-slate-800/60 text-slate-400 border-slate-700",
  "Inmobiliaria":              "bg-indigo-900/40 text-indigo-400 border-indigo-800",
  "Seguros/Finanzas":          "bg-violet-900/40 text-violet-400 border-violet-800",
  "Educación/Clases":          "bg-blue-900/40 text-blue-300 border-blue-700",
  "Fotografía/Arte":           "bg-fuchsia-900/40 text-fuchsia-400 border-fuchsia-800",
  "Contaduría/Administración": "bg-gray-800/60 text-gray-300 border-gray-700",
  "Agro/Cerealista":           "bg-green-900/40 text-green-300 border-green-700",
  "Otro":                      "bg-gray-800 text-gray-400 border-gray-700",
};

const RUBRO_COLORS_LIGHT: Record<string, string> = {
  "Almacén/Despensa":          "bg-amber-100 text-amber-700 border-amber-300",
  "Restaurante/Comida":        "bg-orange-100 text-orange-700 border-orange-300",
  "Indumentaria":              "bg-pink-100 text-pink-700 border-pink-300",
  "Calzado":                   "bg-rose-100 text-rose-700 border-rose-300",
  "Electrónica":               "bg-blue-100 text-blue-700 border-blue-300",
  "Tecnología/Informática":    "bg-sky-100 text-sky-700 border-sky-300",
  "Ferretería":                "bg-gray-100 text-gray-600 border-gray-300",
  "Materiales/Construcción":   "bg-stone-100 text-stone-700 border-stone-300",
  "Farmacia":                  "bg-green-100 text-green-700 border-green-300",
  "Salud/Bienestar":           "bg-emerald-100 text-emerald-700 border-emerald-300",
  "Peluquería/Estética":       "bg-purple-100 text-purple-700 border-purple-300",
  "Librería/Papelería":        "bg-cyan-100 text-cyan-700 border-cyan-300",
  "Veterinaria":               "bg-teal-100 text-teal-700 border-teal-300",
  "Deportes":                  "bg-lime-100 text-lime-700 border-lime-300",
  "Mueblería":                 "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Joyería/Relojería":         "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Automotriz/Mecánica":       "bg-slate-100 text-slate-700 border-slate-300",
  "Inmobiliaria":              "bg-indigo-100 text-indigo-700 border-indigo-300",
  "Seguros/Finanzas":          "bg-violet-100 text-violet-700 border-violet-300",
  "Educación/Clases":          "bg-blue-50 text-blue-600 border-blue-200",
  "Fotografía/Arte":           "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300",
  "Contaduría/Administración": "bg-gray-100 text-gray-600 border-gray-300",
  "Agro/Cerealista":           "bg-green-50 text-green-700 border-green-200",
  "Otro":                      "bg-gray-100 text-gray-600 border-gray-300",
};

// Colores de fondo para gradiente cuando no hay foto
const RUBRO_GRADIENT: Record<string, string> = {
  "Almacén/Despensa":          "from-amber-950 to-amber-800",
  "Restaurante/Comida":        "from-orange-950 to-orange-800",
  "Indumentaria":              "from-pink-950 to-pink-800",
  "Calzado":                   "from-rose-950 to-rose-800",
  "Electrónica":               "from-blue-950 to-blue-800",
  "Tecnología/Informática":    "from-sky-950 to-sky-800",
  "Ferretería":                "from-zinc-900 to-zinc-700",
  "Materiales/Construcción":   "from-stone-900 to-stone-700",
  "Farmacia":                  "from-green-950 to-green-800",
  "Salud/Bienestar":           "from-emerald-950 to-emerald-800",
  "Peluquería/Estética":       "from-purple-950 to-purple-800",
  "Librería/Papelería":        "from-cyan-950 to-cyan-800",
  "Veterinaria":               "from-teal-950 to-teal-800",
  "Deportes":                  "from-lime-950 to-lime-800",
  "Mueblería":                 "from-yellow-950 to-yellow-800",
  "Joyería/Relojería":         "from-yellow-950 to-yellow-800",
  "Automotriz/Mecánica":       "from-slate-900 to-slate-700",
  "Inmobiliaria":              "from-indigo-950 to-indigo-800",
  "Seguros/Finanzas":          "from-violet-950 to-violet-800",
  "Educación/Clases":          "from-blue-950 to-blue-700",
  "Fotografía/Arte":           "from-fuchsia-950 to-fuchsia-800",
  "Contaduría/Administración": "from-gray-900 to-gray-700",
  "Agro/Cerealista":           "from-green-950 to-green-700",
  "Otro":                      "from-gray-900 to-gray-700",
};

function photoUrl(url: string): string {
  if (!url) return url;
  return url.startsWith("/uploads/") ? `${API}${url}` : url;
}

function trackEvent(slug: string, type: string) {
  fetch(`${API}/api/comercios/${slug}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  }).catch(() => {});
}

const WaIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ComercioProfileClient({ comercio, isOwner }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const key = `viewed_comercio_${comercio.slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    trackEvent(comercio.slug, "profile_view");
  }, [comercio.slug]);

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

  const activeOffers = comercio.offers || [];
  const activeProductos = comercio.productos || [];

  // Galeria: si no hay fotos adicionales pero hay foto principal, mostrarla
  const galeriaFotos = comercio.fotos && comercio.fotos.length > 0
    ? comercio.fotos
    : (comercio.foto ? [comercio.foto] : []);

  return (
    <div className={`min-h-screen ${bg} ${textPrimary} flex flex-col`}>
      <Navbar sidebarDisabled />

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Cerrar */}
          <button
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/20"
            onClick={() => setLightboxIdx(null)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Flecha izquierda */}
          {galeriaFotos.length > 1 && (
            <button
              className="absolute left-3 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/20"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + galeriaFotos.length) % galeriaFotos.length); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Imagen */}
          <img
            src={photoUrl(galeriaFotos[lightboxIdx])}
            alt="Foto del comercio"
            className="max-w-[85vw] max-h-[85vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Flecha derecha */}
          {galeriaFotos.length > 1 && (
            <button
              className="absolute right-3 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/20"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % galeriaFotos.length); }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Contador */}
          {galeriaFotos.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <span className="text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
                {lightboxIdx + 1} / {galeriaFotos.length}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 max-w-xl mx-auto w-full pb-40">

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
            {/* Fila avatar + nombre */}
            <div className="flex items-end gap-3 -mt-10 mb-2">
              <div className={`w-20 h-20 rounded-full overflow-hidden border-4 flex-shrink-0 ${isDark ? "border-gray-900 bg-gray-800" : "border-white bg-gray-100"}`}>
                {(comercio.logo || comercio.foto) ? (
                  <img
                    src={photoUrl((comercio.logo || comercio.foto)!)}
                    alt={comercio.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${textMuted}`}>
                    {comercio.nombre[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="pb-1 min-w-0">
                <h1 className={`text-lg font-black leading-tight truncate ${textPrimary}`}>{comercio.nombre}</h1>
              </div>
            </div>
            {/* Pills separadas — con espacio propio, lejos del hero */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${rubroBadge}`}>
                {comercio.rubro}
              </span>
              {comercio.isFounder && (
                <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-semibold bg-blue-500/10 border-blue-500/30 text-blue-400">
                  ★ Comercio Fundador
                </span>
              )}
              {comercio.barrio && (
                <span className={`flex items-center gap-1 text-xs ${textMuted}`}>
                  <MapPin className="w-3 h-3" />
                  {comercio.barrio}
                </span>
              )}
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
              onClick={() => trackEvent(comercio.slug, "whatsapp_click")}
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
                  onClick={() => setLightboxIdx(i)}
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

        {/* ── Productos ───────────────────────────────────────────────── */}
        {(activeProductos.length > 0 || isOwner) && (
          <div className="mx-4 mt-4 mb-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className={`text-base font-bold ${textPrimary}`}>
                  Catálogo
                  {activeProductos.length > 0 && <span className={`ml-2 text-sm font-normal ${textMuted}`}>({activeProductos.length})</span>}
                </p>
                <p className={`text-xs mt-0.5 ${textMuted}`}>Consultá por precio o disponibilidad via WhatsApp</p>
              </div>
              {isOwner && (
                <button onClick={() => router.push("/comercio/gestionar?tab=productos")} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border transition-colors ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  <Pencil className="w-3 h-3" /> Gestionar
                </button>
              )}
            </div>

            {activeProductos.length === 0 ? (
              <div className={`py-8 text-center rounded-2xl border ${cardBg}`}>
                <ShoppingBag className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
                <p className={`text-sm ${textMuted}`}>No hay items en el catálogo aun.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {activeProductos.map((p) => (
                  <ProductoCard
                    key={p.id}
                    producto={p}
                    whatsapp={comercio.whatsapp}
                    comercioNombre={comercio.nombre}
                    comercioSlug={comercio.slug}
                    isDark={isDark}
                    cardBg={cardBg}
                    textPrimary={textPrimary}
                    textSec={textSec}
                    textMuted={textMuted}
                  />
                ))}
              </div>
            )}
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
                  comercioNombre={comercio.nombre}
                  comercioLogo={comercio.logo ?? undefined}
                  comercioSlug={comercio.slug}
                  isOwner={isOwner}
                  onEdit={() => router.push("/comercio/gestionar?tab=ofertas")}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Producto Card ───────────────────────────────────────────────────────────

function ProductoCard({
  producto, whatsapp, comercioNombre, comercioSlug, isDark, cardBg, textPrimary, textSec, textMuted,
}: {
  producto: Producto;
  whatsapp: string;
  comercioNombre: string;
  comercioSlug: string;
  isDark: boolean;
  cardBg: string;
  textPrimary: string;
  textSec: string;
  textMuted: string;
}) {
  const fotoResolved = producto.foto
    ? producto.foto.startsWith("http") ? producto.foto : `${API}${producto.foto}`
    : null;

  const esServicio = producto.tipo === "servicio";
  const waMsg = encodeURIComponent(
    esServicio
      ? `Hola ${comercioNombre}! Me interesa el servicio: *${producto.nombre}*${producto.precio ? ` (${producto.precio})` : ""}. ¿Podemos hablar?`
      : `Hola ${comercioNombre}! Me interesa el producto: *${producto.nombre}*${producto.precio ? ` (${producto.precio})` : ""}. ¿Tienen disponibilidad?`
  );
  const waUrl = `https://wa.me/${whatsapp}?text=${waMsg}`;

  return (
    <div className={`rounded-2xl border overflow-hidden flex flex-col ${cardBg}`}>
      {fotoResolved ? (
        <img src={fotoResolved} alt={producto.nombre} className="w-full h-36 object-cover flex-shrink-0" />
      ) : (
        <div className={`w-full h-28 flex items-center justify-center flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
          <ShoppingBag className={`w-8 h-8 ${textMuted}`} />
        </div>
      )}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="flex items-start justify-between gap-1">
          <p className={`text-xs font-bold leading-snug line-clamp-2 ${textPrimary}`}>{producto.nombre}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded-full border flex-shrink-0 capitalize ${
            esServicio
              ? isDark ? "bg-blue-900/40 text-blue-400 border-blue-800" : "bg-blue-100 text-blue-700 border-blue-300"
              : isDark ? "bg-amber-900/40 text-amber-400 border-amber-800" : "bg-amber-100 text-amber-700 border-amber-300"
          }`}>
            {producto.tipo ?? "producto"}
          </span>
        </div>
        {producto.descripcion && <p className={`text-xs leading-snug line-clamp-2 ${textSec}`}>{producto.descripcion}</p>}
        {producto.precio && <p className={`text-sm font-black text-green-500 dark:text-green-400`}>{producto.precio}</p>}
        <div className="mt-auto flex flex-col gap-1.5">
          <a
            href={`/comercio/${comercioSlug}/producto/${producto.id}`}
            className={`flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Ver detalle
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {esServicio ? "Consultar servicio" : "Consultar"}
          </a>
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
  comercioNombre,
  comercioLogo,
  comercioSlug,
  isOwner,
  onEdit,
}: {
  offer: ComercioOffer;
  whatsapp: string;
  isDark: boolean;
  cardBg: string;
  textPrimary: string;
  textSec: string;
  textMuted: string;
  tagBg: string;
  comercioNombre: string;
  comercioLogo?: string;
  comercioSlug: string;
  isOwner?: boolean;
  onEdit?: () => void;
}) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const waText = encodeURIComponent(`Hola! Te consulto por la oferta: ${offer.titulo}`);
  const waUrl  = `https://wa.me/${whatsapp}?text=${waText}`;

  function buildShareParams() {
    const validaHastaStr = offer.validaHasta
      ? new Date(offer.validaHasta).toLocaleDateString("es-AR", { day: "numeric", month: "long" })
      : "";
    const offerPageUrl = `${window.location.origin}/comercio/${comercioSlug}/oferta/${offer.id}`;
    return new URLSearchParams({
      titulo: offer.titulo,
      precio: offer.precio ?? "",
      foto: offer.foto ? photoUrl(offer.foto) : "",
      comercio: comercioNombre,
      logo: comercioLogo ? photoUrl(comercioLogo) : "",
      validaHasta: validaHastaStr,
      offerUrl: offerPageUrl,
    });
  }

  // Step 1: open modal immediately (synchronous), then prefetch blob in background
  function openShareModal() {
    setShareBlob(null);
    setShareError(null);
    setShareModalOpen(true);
    const params = buildShareParams();
    fetch(`/share/offer?${params}`)
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.blob(); })
      .then((blob) => setShareBlob(blob))
      .catch(() => setShareError("No se pudo generar la imagen."));
  }

  // Step 2: called from inside modal — this IS a fresh user gesture
  function doNativeShare() {
    if (!shareBlob) return;
    const file = new File([shareBlob], "oferta.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], title: offer.titulo }).catch((e) => {
        if (e.name !== "AbortError") setShareError("No se pudo compartir.");
      });
    }
  }

  function closeModal() {
    setShareModalOpen(false);
    setShareBlob(null);
    setShareError(null);
    setCopied(false);
  }

  function copyLink() {
    const url = `${window.location.origin}/comercio/${comercioSlug}/oferta/${offer.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const validaHasta = offer.validaHasta
    ? new Date(offer.validaHasta).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const shareParams = shareModalOpen ? buildShareParams() : null;
  const previewSrc  = shareParams ? `/share/offer?${shareParams}` : null;
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.canShare;

  return (
    <>
    {/* Share modal */}
    {shareModalOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
        onClick={closeModal}
      >
        <div className="flex flex-col items-center gap-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
          <p className="text-white text-sm font-semibold text-center">{offer.titulo}</p>

          {/* Preview image — loads via browser naturally, no fetch needed */}
          <div className="w-full rounded-2xl overflow-hidden bg-gray-900" style={{ aspectRatio: "9/16" }}>
            {previewSrc && (
              <img src={previewSrc} alt="Story preview" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            {canNativeShare && (
              <button
                onClick={doNativeShare}
                disabled={!shareBlob}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white bg-blue-600 disabled:opacity-50 disabled:cursor-wait transition-opacity"
              >
                {shareBlob ? "Compartir historia" : "Preparando imagen..."}
              </button>
            )}
            {!canNativeShare && (
              <p className="text-gray-400 text-xs text-center">Mantené presionada la imagen para guardarla</p>
            )}
            {shareError && <p className="text-red-400 text-xs text-center">{shareError}</p>}
            <button
              onClick={copyLink}
              className="w-full py-3 rounded-2xl text-sm font-semibold border border-gray-600 text-gray-300 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Link copiado!" : "Copiar link de la oferta"}
            </button>
            <button onClick={closeModal} className="text-gray-500 text-xs text-center py-1">Cerrar</button>
          </div>
        </div>
      </div>
    )}

    <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
      <a href={`/comercio/${comercioSlug}/oferta/${offer.id}`} className="block">
        {/* Foto arriba, full width */}
        {offer.foto && (
          <div className="w-full h-44 overflow-hidden">
            <img
              src={photoUrl(offer.foto)}
              alt={offer.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Contenido */}
        <div className="p-4">
          <p className={`font-bold text-sm leading-snug ${textPrimary}`}>{offer.titulo}</p>
          {offer.descripcion && (
            <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${textSec}`}>{offer.descripcion}</p>
          )}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {offer.precio && (
              <span className={`text-lg font-black px-3 py-1 rounded-xl border ${
                isDark
                  ? "bg-yellow-400/10 text-yellow-300 border-yellow-700"
                  : "bg-yellow-50 text-yellow-700 border-yellow-300"
              }`}>
                $ {Number(offer.precio).toLocaleString("es-AR")}
              </span>
            )}
            {validaHasta && (
              <span className={`text-xs ${textMuted}`}>Hasta el {validaHasta}</span>
            )}
          </div>
        </div>
      </a>

      {/* Botones — full width, sin apretujarse */}
      <div className="px-4 pb-4 flex gap-2">
        {isOwner && onEdit && (
          <button
            onClick={onEdit}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 flex-shrink-0 ${
              isDark
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#25D366" }}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
        <button
          onClick={openShareModal}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 flex-shrink-0 ${
            isDark
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          Story
        </button>
      </div>
    </div>
    </>
  );
}
