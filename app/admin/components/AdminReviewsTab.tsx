"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import type { Review } from "../types";

interface Props {
  reviews: Review[];
  deletingId: string | null;
  onDelete: (id: string) => void;
}

export function AdminReviewsTab({ reviews, deletingId, onDelete }: Props) {
  const { isDark } = useTheme();
  const bgCard = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const btnRed = isDark ? "bg-red-900/30 text-red-400 border-red-800/50 hover:bg-red-900/60" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted = isDark ? "text-gray-600" : "text-gray-500";

  if (reviews.length === 0) {
    return <p className={`text-sm ${textMuted} text-center py-8`}>No hay reseñas.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {reviews.map(rev => (
        <div key={rev.id} className={`flex items-start gap-3 p-4 rounded-2xl border ${bgCard}`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-xs font-semibold ${textPrimary}`}>{rev.reviewerName}</span>
              <span className="text-xs text-yellow-400">{"★".repeat(Math.round(rev.score))} {rev.score.toFixed(1)}</span>
            </div>
            <p className={`text-xs ${textSecondary} truncate`}>{rev.comment}</p>
            <p className={`text-xs ${textMuted} mt-0.5`}>
              Para:{" "}
              <Link href={`/profesional/${rev.professional.slug}`} className="hover:underline">
                {rev.professional.nombre} {rev.professional.apellido}
              </Link>
              {" "}·{" "}
              {new Date(rev.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => onDelete(rev.id)}
            disabled={deletingId === rev.id}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl border ${btnRed} text-xs font-medium transition-colors disabled:opacity-40`}
          >
            {deletingId === rev.id ? "..." : "Eliminar"}
          </button>
        </div>
      ))}
    </div>
  );
}
