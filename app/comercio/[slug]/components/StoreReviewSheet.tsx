"use client";

import { useState } from "react";
import Image from "next/image";
import type { Comercio } from "@/types";
import type { ThemeClasses } from "./types";
import { resolvePhotoUrl } from "@/lib/utils/photo";

const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";
const SCORE_LABELS = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];
const SCORE_COLORS = ["", "text-red-500", "text-orange-400", "text-yellow-400", "text-green-400", "text-emerald-400"];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex gap-3 justify-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="focus:outline-none transition-transform active:scale-90"
          style={{ transform: i <= active ? "scale(1.15)" : "scale(1)" }}
        >
          <svg
            className={`w-11 h-11 transition-all duration-150 ${i <= active ? "text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" : "text-gray-400"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}

interface Props {
  comercio: Comercio;
  theme: ThemeClasses;
  submitting: boolean;
  error: string;
  score: number;
  onScore: (s: number) => void;
  onClose: () => void;
}

export function StoreReviewSheet({ comercio, theme, submitting, error, score, onScore, onClose }: Props) {
  const { isDark } = theme;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4"
      onClick={() => { if (!submitting) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex flex-col items-center gap-5 rounded-t-3xl md:rounded-3xl border-t md:border px-6 pt-6 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] md:pb-8 md:max-w-sm md:w-full ${isDark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"}`}
      >
        <div className={`w-10 h-1 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

        {(comercio.logo || comercio.foto) && (
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 shadow-lg flex-shrink-0" style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}>
            <Image src={resolvePhotoUrl((comercio.logo || comercio.foto)!)} alt={comercio.nombre} fill className="object-cover" />
          </div>
        )}

        <div className="text-center">
          <p className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {submitting ? "Guardando..." : "¿Cómo fue tu experiencia?"}
          </p>
          <p className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{comercio.nombre}</p>
        </div>

        <StarPicker
          value={score}
          onChange={(s) => { if (!submitting) onScore(s); }}
        />

        <div className="h-5">
          {score > 0 && !submitting && (
            <p className={`text-sm font-semibold transition-all ${SCORE_COLORS[score]}`}>
              {SCORE_LABELS[score]}
            </p>
          )}
          {submitting && (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 text-center -mt-2">{error}</p>
        )}

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
