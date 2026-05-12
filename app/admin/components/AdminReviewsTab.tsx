"use client";

import Link from "next/link";
import type { Review } from "../types";

interface Props {
  reviews: Review[];
  deletingId: string | null;
  onDelete: (id: string) => void;
}

export function AdminReviewsTab({ reviews, deletingId, onDelete }: Props) {
  if (reviews.length === 0) {
    return <p className="text-sm text-gray-600 text-center py-8">No hay reseñas.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {reviews.map(rev => (
        <div key={rev.id} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-900 border border-gray-800">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-white">{rev.reviewerName}</span>
              <span className="text-xs text-yellow-400">{"★".repeat(Math.round(rev.score))} {rev.score.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-400 truncate">{rev.comment}</p>
            <p className="text-xs text-gray-600 mt-0.5">
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
            className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-red-900/30 text-red-400 border border-red-800/50 hover:bg-red-900/60 text-xs font-medium transition-colors disabled:opacity-40"
          >
            {deletingId === rev.id ? "..." : "Eliminar"}
          </button>
        </div>
      ))}
    </div>
  );
}
