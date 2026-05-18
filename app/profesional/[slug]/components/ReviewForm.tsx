"use client";

import Image from "next/image";
import { resolvePhotoUrl } from "../../../lib/utils/photo";
import type { ProfessionalDetail } from "../../../types";
import { StarPicker, SCORE_LABELS, SCORE_COLORS } from "./Stars";

interface Props {
  pro: Pick<ProfessionalDetail, "nombre"> & { foto?: string | null };
  formScore: number;
  submitting: boolean;
  submitError: string;
  isDark: boolean;
  onScoreChange: (score: number) => void;
  onCancel: () => void;
}

export function ReviewForm({ pro, formScore, submitting, submitError, isDark, onScoreChange, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4"
      onClick={() => { if (!submitting) onCancel(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex flex-col items-center gap-5 rounded-t-3xl md:rounded-3xl border-t md:border px-6 pt-6 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] md:pb-8 md:max-w-sm md:w-full ${isDark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"}`}
      >
        <div className={`w-10 h-1 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

        {pro.foto && (
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 shadow-lg flex-shrink-0 relative" style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}>
            <Image
              src={resolvePhotoUrl(pro.foto)}
              alt={pro.nombre}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="text-center">
          <p className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {submitting ? "Guardando..." : "¿Cómo fue tu experiencia?"}
          </p>
          <p className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{pro.nombre}</p>
        </div>

        <StarPicker
          value={formScore}
          onChange={(score) => {
            if (submitting) return;
            onScoreChange(score);
          }}
        />

        <div className="h-5">
          {formScore > 0 && !submitting && (
            <p className={`text-sm font-semibold transition-all ${SCORE_COLORS[formScore]}`}>
              {SCORE_LABELS[formScore]}
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

        {submitError && (
          <p className="text-xs text-red-400 text-center -mt-2">{submitError}</p>
        )}

        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
