"use client";

import type { Report } from "../types";

interface Props {
  reports: Report[];
  deletingId: string | null;
  onDelete: (id: string) => void;
}

export function AdminReportsTab({ reports, deletingId, onDelete }: Props) {
  if (reports.length === 0) {
    return <p className="text-sm text-gray-600 text-center py-8">No hay reportes.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {reports.map(rep => (
        <div key={rep.id} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-900 border border-gray-800">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-white capitalize">{rep.category.replace(/_/g, " ")}</span>
              {rep.isUrgent && (
                <span className="text-xs bg-red-900/40 text-red-400 border border-red-800 px-1.5 py-0.5 rounded-full">Urgente</span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">{rep.description}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {rep.barrio} · {rep.direccion} ·{" "}
              {new Date(rep.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => onDelete(rep.id)}
            disabled={deletingId === rep.id}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-red-900/30 text-red-400 border border-red-800/50 hover:bg-red-900/60 text-xs font-medium transition-colors disabled:opacity-40"
          >
            {deletingId === rep.id ? "..." : "Eliminar"}
          </button>
        </div>
      ))}
    </div>
  );
}
