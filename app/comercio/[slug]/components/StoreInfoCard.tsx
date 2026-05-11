"use client";

import { MapPin, Clock, Phone, ThumbsUp, Pencil, Users } from "lucide-react";
import type { Comercio } from "../../../types";
import type { ThemeClasses } from "./types";
import SumateButton from "../../../components/SumateButton";
import { resolvePhotoUrl } from "../../../lib/utils/photo";

const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

function WaIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface Props {
  comercio: Comercio;
  theme: ThemeClasses;
  rubroBadge: string;
  isOwner?: boolean;
  recommended: boolean;
  recCount: number;
  onRecommend: () => void;
  onManage: () => void;
}

export function StoreInfoCard({ comercio, theme, rubroBadge, isOwner, recommended, recCount, onRecommend, onManage }: Props) {
  const { isDark, textPrimary, textSec, textMuted, cardBg } = theme;
  const waText = encodeURIComponent("Hola, te contacto desde Reportes Reconquista");
  const waUrl  = `https://wa.me/${comercio.whatsapp}?text=${waText}`;

  return (
    <div className={`mx-4 rounded-2xl border ${cardBg} overflow-visible -mt-4`}>
      <div className="relative px-5 pt-2">
        <div className="-mt-12 mb-3">
          <div
            className={`w-20 h-20 rounded-full overflow-hidden border-4 flex-shrink-0 ${isDark ? "border-gray-900 bg-gray-800" : "border-white bg-gray-100"}`}
            style={{ viewTransitionName: `co-photo-${comercio.slug}` }}
          >
            {(comercio.logo || comercio.foto) ? (
              <img
                src={resolvePhotoUrl((comercio.logo || comercio.foto)!)}
                alt={comercio.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${textMuted}`}>
                {comercio.nombre[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <h1
          className={`text-xl font-black leading-tight mb-3 ${textPrimary}`}
          style={{ viewTransitionName: `co-name-${comercio.slug}` }}
        >
          {comercio.nombre}
        </h1>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${rubroBadge}`}>
            {comercio.rubro}
          </span>
          {comercio.isFounder && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-semibold bg-amber-400/20 border-amber-400/30 text-amber-400">
              ★ Founder
            </span>
          )}
          {comercio.isPremium && !comercio.isFounder && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-semibold bg-indigo-400/20 border-indigo-400/30 text-indigo-400">
              ✦ Premium
            </span>
          )}
          {(comercio.ratingAvg ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-semibold bg-yellow-400/15 border-yellow-400/30 text-yellow-500">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d={STAR_PATH} /></svg>
              {(comercio.ratingAvg ?? 0).toFixed(1)}
              <span className="font-normal opacity-70">({comercio.ratingCount})</span>
            </span>
          )}
          {(comercio._count?.suscriptores ?? 0) > 0 && (
            <span className={`flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              isDark ? "bg-blue-500/20 border border-blue-500/40 text-blue-400" : "bg-blue-50 border border-blue-200 text-blue-600"
            }`}>
              <Users className="w-3 h-3" />
              {comercio._count?.suscriptores}
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

        {comercio.descripcion && (
          <div className={`mt-4 px-3 py-3 rounded-xl text-sm leading-relaxed ${isDark ? "bg-gray-800/60 text-gray-300" : "bg-gray-50 text-gray-700"}`}>
            {comercio.descripcion}
          </div>
        )}

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

        <button
          onClick={onRecommend}
          disabled={recommended}
          className={"mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm transition-colors " + (recommended ? (isDark ? "bg-green-900/30 border border-green-800 text-green-400 cursor-default" : "bg-green-600 border border-green-700 text-white cursor-default") : "bg-amber-500 hover:bg-amber-400 text-white")}
        >
          {recommended ? (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Ya recomendaste este comercio</>
          ) : (
            <><ThumbsUp className="w-4 h-4" />{recCount > 0 ? "Recomendar · " + recCount : "Recomendar"}</>
          )}
        </button>

        {isOwner && (
          <button
            onClick={onManage}
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
        {!isOwner && (
          <SumateButton slug={comercio.slug} isDark={isDark} />
        )}
      </div>
    </div>
  );
}
