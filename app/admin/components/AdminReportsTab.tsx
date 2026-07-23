"use client";

import { useTheme } from "@/contexts/ThemeContext";
import type { Report } from "../types";

interface Props {
  reports: Report[];
  deletingId: string | null;
  onDelete: (id: string) => void;
}

export function AdminReportsTab({ reports, deletingId, onDelete }: Props) {
  const { isDark } = useTheme();
  const bgCard = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const btnRed = isDark ? "bg-red-900/30 text-red-400 border-red-800/50 hover:bg-red-900/60" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100";
  const badgeRed = isDark ? "bg-red-900/40 text-red-400 border-red-800" : "bg-red-50 text-red-600 border-red-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted = isDark ? "text-gray-600" : "text-gray-500";

  if (reports.length === 0) {
    return <p className={`text-sm ${textMuted} text-center py-8`}>No hay reportes.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {reports.map(rep => (
        <div key={rep.id} className={`flex items-start gap-3 p-4 rounded-2xl border ${bgCard}`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-xs font-semibold ${textPrimary} capitalize`}>{rep.category.replace(/_/g, " ")}</span>
              {rep.isUrgent && (
                <span className={`text-xs border px-1.5 py-0.5 rounded-full ${badgeRed}`}>Urgente</span>
              )}
            </div>
            <p className={`text-xs ${textSecondary} truncate`}>{rep.description}</p>
            <p className={`text-xs ${textMuted} mt-0.5`}>
              {rep.barrio} · {rep.direccion} ·{" "}
              {new Date(rep.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => onDelete(rep.id)}
            disabled={deletingId === rep.id}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl border ${btnRed} text-xs font-medium transition-colors disabled:opacity-40`}
          >
            {deletingId === rep.id ? "..." : "Eliminar"}
          </button>
        </div>
      ))}
    </div>
  );
}
