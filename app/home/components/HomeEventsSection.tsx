"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronRight, MapPin } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import type { Evento } from "@/lib/types/evento";
import { CATEGORIA_EMOJI } from "@/lib/types/evento";
import { resolvePhotoUrl } from "@/lib/utils/photo";

function formatFechaCorta(iso: string) {
  const d = new Date(iso);
  const hoy = new Date();
  const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
  if (d.toDateString() === hoy.toDateString())    return "Hoy · " + d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === manana.toDateString()) return "Mañana · " + d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
}

function EventoBanner({ evento, isDark }: { evento: Evento; isDark: boolean }) {
  const banner = evento.banner ? resolvePhotoUrl(evento.banner) : null;
  const dias   = Math.ceil((new Date(evento.fecha).getTime() - Date.now()) / 86400000);

  return (
    <Link href={`/evento/${evento.slug}`} className="block flex-shrink-0 w-72 rounded-2xl overflow-hidden relative group cursor-pointer">
      <div className="h-40 w-full relative">
        {banner ? (
          <Image src={banner} alt={evento.nombre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-5xl ${isDark ? "bg-gray-800" : "bg-gradient-to-br from-indigo-100 to-purple-200"}`}>
            {CATEGORIA_EMOJI[evento.categoria] ?? "📌"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Countdown */}
        {dias >= 0 && dias <= 7 && (
          <div className="absolute top-2 right-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${dias === 0 ? "bg-red-500" : "bg-amber-500"}`}>
              {dias === 0 ? "Hoy" : `${dias}d`}
            </span>
          </div>
        )}

        {/* Categoria */}
        <div className="absolute top-2 left-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
            {CATEGORIA_EMOJI[evento.categoria]} {evento.categoria}
          </span>
        </div>

        {/* Info sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-bold text-sm leading-snug line-clamp-2">{evento.nombre}</p>
          <div className="flex items-center gap-1 mt-1 text-white/80 text-xs">
            <Calendar className="w-3 h-3" />
            <span>{formatFechaCorta(evento.fecha)}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-white/70 text-xs">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{evento.lugar}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function HomeEventsSection({ eventos }: { eventos: Evento[] }) {
  const { isDark } = useTheme();

  if (eventos.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className={`text-base font-black ${isDark ? "text-white" : "text-gray-900"}`}>Proximos eventos</h2>
          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Lo que se viene en Reconquista</p>
        </div>
        <Link href="/eventos" className="flex items-center gap-0.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
          Ver todos <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Banner grande del próximo evento */}
      {eventos[0] && (
        <Link href={`/evento/${eventos[0].slug}`} className="block relative rounded-2xl overflow-hidden mb-3 group">
          <div className="h-48 w-full relative">
            {eventos[0].banner ? (
              <Image src={resolvePhotoUrl(eventos[0].banner)} alt={eventos[0].nombre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-7xl ${isDark ? "bg-gray-800" : "bg-gradient-to-br from-indigo-200 to-purple-300"}`}>
                {CATEGORIA_EMOJI[eventos[0].categoria] ?? "📌"}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500 text-white">
                Proximo evento
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-xs text-white/70 mb-1 block">{CATEGORIA_EMOJI[eventos[0].categoria]} {eventos[0].categoria}</span>
              <h3 className="text-white font-black text-lg leading-tight mb-1">{eventos[0].nombre}</h3>
              <div className="flex items-center gap-3 text-white/80 text-xs">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatFechaCorta(eventos[0].fecha)}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{eventos[0].lugar}</span>
                {eventos[0].precio && <span className="font-semibold text-green-400">{eventos[0].precio}</span>}
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Scroll horizontal de los siguientes */}
      {eventos.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {eventos.slice(1).map(e => <EventoBanner key={e.id} evento={e} isDark={isDark} />)}
        </div>
      )}
    </section>
  );
}
