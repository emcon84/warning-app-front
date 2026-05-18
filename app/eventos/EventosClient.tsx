"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar, MapPin, Ticket, Plus, LayoutGrid,
  Music, UtensilsCrossed, Trophy, Mic2, Palette,
  PartyPopper, ShoppingBag, GraduationCap, Heart, Tag,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import type { Evento, CategoriaEvento } from "@/lib/types/evento";
import { CATEGORIAS_EVENTO, CATEGORIA_EMOJI } from "@/lib/types/evento";
import { resolvePhotoUrl } from "@/lib/utils/photo";

const CATEGORIA_ICON: Record<string, React.ElementType> = {
  "Todos":       LayoutGrid,
  "Música":      Music,
  "Gastronomía": UtensilsCrossed,
  "Deportes":    Trophy,
  "Teatro":      Mic2,
  "Arte":        Palette,
  "Fiesta":      PartyPopper,
  "Feria":       ShoppingBag,
  "Educación":   GraduationCap,
  "Solidario":   Heart,
  "Otro":        Tag,
};

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function EventoCard({ evento, isDark }: { evento: Evento; isDark: boolean }) {
  const banner = evento.banner ? resolvePhotoUrl(evento.banner) : null;
  const dias   = Math.ceil((new Date(evento.fecha).getTime() - Date.now()) / 86400000);
  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  return (
    <Link href={`/evento/${evento.slug}`} className={`group rounded-2xl border overflow-hidden flex flex-col transition-all hover:scale-[1.01] hover:shadow-xl ${cardBg}`}>
      <div className="relative h-48 w-full flex-shrink-0 overflow-hidden">
        {banner ? (
          <Image src={banner} alt={evento.nombre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-5xl ${isDark ? "bg-gray-800" : "bg-gradient-to-br from-indigo-100 to-purple-100"}`}>
            {CATEGORIA_EMOJI[evento.categoria] ?? "📌"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
            {CATEGORIA_EMOJI[evento.categoria]} {evento.categoria}
          </span>
          {dias >= 0 && dias <= 7 && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${dias === 0 ? "bg-red-500" : "bg-amber-500"} text-white`}>
              {dias === 0 ? "Hoy" : `En ${dias}d`}
            </span>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className={`font-bold text-base leading-snug line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>{evento.nombre}</h3>
        <div className={`flex items-center gap-1.5 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{formatFecha(evento.fecha)}</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{evento.lugar}{evento.barrio ? ` · ${evento.barrio}` : ""}</span>
        </div>
        {evento.precio && (
          <div className="flex items-center gap-1.5 text-xs text-green-500 font-semibold">
            <Ticket className="w-3.5 h-3.5" />{evento.precio}
          </div>
        )}
        <p className={`text-xs mt-auto pt-2 border-t ${isDark ? "border-gray-800 text-gray-500" : "border-gray-100 text-gray-400"}`}>
          por {evento.organizador} · {evento._count.comentarios} comentarios
        </p>
      </div>
    </Link>
  );
}

export default function EventosClient({ eventosIniciales }: { eventosIniciales: Evento[] }) {
  const { isDark } = useTheme();
  const [filtro, setFiltro] = useState<CategoriaEvento | "Todos">("Todos");

  const filtrados = filtro === "Todos"
    ? eventosIniciales
    : eventosIniciales.filter(e => e.categoria === filtro);

  const bg      = isDark ? "bg-gray-950 min-h-screen" : "bg-gray-50 min-h-screen";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textMut = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={bg}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-black ${textPri}`}>Eventos</h1>
            <p className={`text-sm mt-0.5 ${textMut}`}>Lo que viene en Reconquista</p>
          </div>
          <Link
            href="/evento/nuevo"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Publicar evento
          </Link>
        </div>

        {/* Filtro categorías — scroll en mobile, wrap en desktop */}
        <div className="flex gap-2 overflow-x-auto md:overflow-visible md:flex-wrap pb-2 mb-6 scrollbar-hide">
          {(["Todos", ...CATEGORIAS_EVENTO] as const).map(cat => {
            const Icon = CATEGORIA_ICON[cat] ?? Tag;
            return (
              <button
                key={cat}
                onClick={() => setFiltro(cat as any)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filtro === cat
                    ? "bg-indigo-500 text-white"
                    : isDark ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {cat}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filtrados.length === 0 ? (
          <div className={`py-20 text-center rounded-2xl border ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
            <p className="text-4xl mb-3">🎉</p>
            <p className={`font-bold ${textPri}`}>No hay eventos próximos</p>
            <p className={`text-sm mt-1 ${textMut}`}>
              {filtro !== "Todos" ? `en la categoría ${filtro}` : "por el momento"}
            </p>
            <Link href="/evento/nuevo" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold">
              <Plus className="w-4 h-4" /> Publicar el primero
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtrados.map(e => <EventoCard key={e.id} evento={e} isDark={isDark} />)}
          </div>
        )}
      </div>
    </div>
  );
}
