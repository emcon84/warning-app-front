"use client";

import type { PublicReview } from "../../../types";
import { Stars } from "./Stars";

interface Props {
  reviews: PublicReview[];
  loading: boolean;
  submitSuccess: boolean;
  reportedIds: Set<string>;
  isSignedIn: boolean;
  showForm: boolean;
  isDark: boolean;
  textSec: string;
  textMuted: string;
  cardBg: string;
  tagBg: string;
  onShowForm: () => void;
  onRequestLogin: () => void;
  onReport: (id: string) => void;
}

export function ProfileReviews({
  reviews, loading, submitSuccess, reportedIds, isSignedIn,
  showForm, isDark, textSec, textMuted, cardBg, tagBg,
  onShowForm, onRequestLogin, onReport,
}: Props) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          Calificaciones{reviews.length > 0 ? ` (${reviews.length})` : ""}
        </p>
        {!showForm && !submitSuccess && (
          <button
            onClick={isSignedIn ? onShowForm : onRequestLogin}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${tagBg} hover:opacity-80`}
          >
            + Calificar
          </button>
        )}
      </div>

      {submitSuccess && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${isDark ? "bg-green-900/30 border border-green-800 text-green-400" : "bg-green-100 border border-green-300 text-green-800"}`}>
          Gracias por tu calificacion!
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className={`h-20 rounded-2xl border animate-pulse ${cardBg}`} />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className={`p-4 rounded-2xl border ${cardBg}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                    {r.reviewerName[0].toUpperCase()}
                  </div>
                  <span className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>{r.reviewerName}</span>
                </div>
                <Stars score={r.score} size="sm" dark={isDark} />
              </div>
              {r.comment && r.comment.trim().length > 0 && (
                <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{r.comment}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <p className={`text-xs ${textMuted}`}>
                  {new Date(r.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                <button
                  onClick={() => onReport(r.id)}
                  disabled={reportedIds.has(r.id)}
                  className={`text-xs transition-colors ${
                    reportedIds.has(r.id)
                      ? "text-orange-400 cursor-default"
                      : isDark ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {reportedIds.has(r.id) ? "Reportada" : "Reportar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className={`text-sm ${textMuted}`}>Aun no hay opiniones.</p>
          {!showForm && (
            <button
              onClick={onShowForm}
              className={`mt-2 text-sm underline transition-colors ${textSec}`}
            >
              Sé el primero en calificar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
