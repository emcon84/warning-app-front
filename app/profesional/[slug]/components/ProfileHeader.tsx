"use client";

import Image from "next/image";
import { resolvePhotoUrl } from "../../../lib/utils/photo";
import type { ProfessionalDetail } from "../../../types";
import { Stars } from "./Stars";

interface Props {
  pro: ProfessionalDetail;
  isDark: boolean;
  textPrimary: string;
  textSec: string;
  textMuted: string;
  tagBg: string;
  onBack: () => void;
}

export function ProfileHeader({ pro, isDark, textPrimary, textSec, textMuted, tagBg, onBack }: Props) {
  return (
    <div className="flex-shrink-0 px-4 pt-16 pb-3">
      <button
        onClick={onBack}
        className={`flex items-center gap-1.5 text-sm mb-4 transition-colors ${textSec}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      <div className="flex items-start gap-5 mb-6">
        <div className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-100"}`}>
          {pro.foto ? (
            <div className="relative w-full h-full">
              <Image
                src={resolvePhotoUrl(pro.foto)}
                alt={pro.nombre}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-4xl font-bold ${textMuted}`}>
              {pro.nombre[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className={`text-xl font-bold ${textPrimary}`}>{pro.nombre} {pro.apellido}</h1>
            {pro.slug.startsWith("test-") && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 leading-none">
                PERFIL DE PRUEBA
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {pro.oficios.map((o) => (
              <span key={o} className={`text-xs px-2.5 py-1 rounded-full border capitalize ${tagBg}`}>
                {o}
              </span>
            ))}
          </div>
          <p className={`text-sm mt-1.5 ${textMuted}`}>{pro.barrio}, Reconquista</p>
          <div className="flex items-center gap-2 mt-2">
            <Stars score={Math.round(pro.ratingAvg)} size="sm" dark={isDark} />
            <span className={`text-sm ${textSec}`}>
              {pro.ratingCount > 0
                ? `${pro.ratingAvg.toFixed(1)} (${pro.ratingCount} opinión${pro.ratingCount !== 1 ? "es" : ""})`
                : "Sin opiniones aún"}
            </span>
          </div>
          {pro.disponible ? (
            <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full border ${isDark ? "bg-green-900/50 text-green-400 border-green-800" : "bg-green-100 text-green-700 border-green-300"}`}>
              Disponible
            </span>
          ) : (
            <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full border ${isDark ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-500 border-gray-300"}`}>
              No disponible
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
