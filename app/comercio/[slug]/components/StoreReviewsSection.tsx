"use client";

import type { Comercio } from "../../../types";
import type { ThemeClasses } from "./types";
import type { StoreReview } from "../../../lib/api/stores";

const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

function Stars({ score, size = "sm", dark = true }: { score: number; size?: "sm" | "md"; dark?: boolean }) {
  const cls = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${cls} ${i <= score ? "text-yellow-400" : dark ? "text-gray-700" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

interface Props {
  comercio: Comercio;
  theme: ThemeClasses;
  reviews: StoreReview[];
  loading: boolean;
  onOpenForm: () => void;
  reviewSuccess: boolean;
  isSignedIn: boolean | undefined;
  onSignIn: () => void;
}

export function StoreReviewsSection({ comercio, theme, reviews, loading, onOpenForm, reviewSuccess, isSignedIn, onSignIn }: Props) {
  const { isDark, textPrimary, textMuted, cardBg, tagBg } = theme;

  return (
    <div className="mx-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          Calificaciones{reviews.length > 0 ? ` (${reviews.length})` : ""}
        </p>
        {!reviewSuccess && isSignedIn && (
          <button
            onClick={onOpenForm}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${tagBg} hover:opacity-80`}
          >
            + Calificar
          </button>
        )}
        {!reviewSuccess && !isSignedIn && (
          <button
            onClick={onSignIn}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${tagBg} hover:opacity-80`}
          >
            + Calificar
          </button>
        )}
      </div>

      {(comercio.ratingAvg ?? 0) > 0 && (
        <div className={`flex items-center gap-3 p-3 rounded-2xl border mb-4 ${cardBg}`}>
          <span className={`text-3xl font-black ${textPrimary}`}>{(comercio.ratingAvg ?? 0).toFixed(1)}</span>
          <div>
            <Stars score={Math.round(comercio.ratingAvg ?? 0)} size="md" dark={isDark} />
            <p className={`text-xs mt-0.5 ${textMuted}`}>{comercio.ratingCount} calificacion{(comercio.ratingCount ?? 0) !== 1 ? "es" : ""}</p>
          </div>
        </div>
      )}

      {reviewSuccess && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${isDark ? "bg-green-900/30 border border-green-800 text-green-400" : "bg-green-100 border border-green-300 text-green-800"}`}>
          Gracias por tu calificacion!
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className={`h-16 rounded-2xl border animate-pulse ${cardBg}`} />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className={`p-4 rounded-2xl border ${cardBg}`}>
              <div className="flex items-center justify-between">
                <Stars score={r.score} size="sm" dark={isDark} />
                <p className={`text-xs ${textMuted}`}>
                  {new Date(r.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className={`text-sm ${textMuted}`}>Aun no hay calificaciones.</p>
          {!reviewSuccess && (
            <button
              onClick={onOpenForm}
              className={`mt-2 text-sm underline transition-colors ${theme.textSec}`}
            >
              Se el primero en calificar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
