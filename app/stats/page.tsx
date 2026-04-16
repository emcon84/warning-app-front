"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Users, BarChart2, FileText, MapPin, ArrowLeft, TrendingUp, Sun, Moon, Briefcase, MessageSquare, Star } from "lucide-react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const SECTION_LABELS: Record<string, string> = {
  reports: "Reportes",
  doctors: "Médicos",
  farmacias: "Farmacias",
  ofertas: "Ofertas",
};

const SECTION_COLORS: Record<string, string> = {
  reports: "bg-blue-500",
  doctors: "bg-emerald-500",
  farmacias: "bg-purple-500",
  ofertas: "bg-amber-500",
};

interface Analytics {
  uniqueVisitors: { today: number; week: number; month: number; total: number };
  topSections: { section: string; visits: number; uniqueVisitors: number }[];
  dailyVisits: { date: string; visits: number; uniqueVisitors: number }[];
  totalReports: number;
  reportsByCategory: { category: string; count: number }[];
  topBarrios: { barrio: string; count: number }[];
  professionals?: { total: number; active: number };
  users?: number;
  conversations?: { total: number; active: number };
  reviews?: number;
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString("es-AR")}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 dark:text-gray-300 font-medium truncate mr-2">{label}</span>
        <span className="text-gray-500 dark:text-gray-400 shrink-0">{value.toLocaleString("es-AR")}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MiniChart({ data }: { data: { date: string; visits: number }[] }) {
  const max = Math.max(...data.map((d) => d.visits), 1);
  return (
    <div className="flex items-end gap-0.5 h-16">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
          <div
            className="w-full bg-blue-400 dark:bg-blue-500 rounded-sm transition-all duration-500 hover:bg-blue-500 dark:hover:bg-blue-400"
            style={{ height: `${Math.max((d.visits / max) * 100, 4)}%` }}
          />
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-gray-500 hidden group-hover:block whitespace-nowrap bg-white dark:bg-gray-900 px-1 rounded shadow">
            {new Date(d.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}: {d.visits}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function StatsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? "dark" : "light";

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/analytics`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const maxSectionVisits = data ? Math.max(...data.topSections.map((s) => s.visits), 1) : 1;
  const maxCategoryCount = data ? Math.max(...data.reportsByCategory.map((r) => r.count), 1) : 1;
  const maxBarrioCount = data ? Math.max(...data.topBarrios.map((b) => b.count), 1) : 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <Link
          href="/app"
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Reportes Reconquista</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
            No se pudo cargar el dashboard.
          </div>
        )}

        {data && (
          <>
            {/* Visitantes únicos */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Visitantes únicos</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Hoy" value={data.uniqueVisitors.today} />
                <StatCard label="Últimos 7 días" value={data.uniqueVisitors.week} />
                <StatCard label="Últimos 30 días" value={data.uniqueVisitors.month} />
                <StatCard label="Total histórico" value={data.uniqueVisitors.total} />
              </div>
            </section>

            {/* Visitas por día */}
            {data.dailyVisits.length > 0 && (
              <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Visitas últimos 30 días</h2>
                </div>
                <MiniChart data={data.dailyVisits} />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-gray-400">{new Date(data.dailyVisits[0].date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>
                  <span className="text-[10px] text-gray-400">{new Date(data.dailyVisits[data.dailyVisits.length - 1].date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>
                </div>
              </section>
            )}

            {/* Secciones más visitadas */}
            {data.topSections.length > 0 && (
              <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Secciones más visitadas</h2>
                </div>
                <div className="space-y-3">
                  {data.topSections.map((s) => (
                    <Bar
                      key={s.section}
                      label={SECTION_LABELS[s.section] ?? s.section}
                      value={s.visits}
                      max={maxSectionVisits}
                      color={SECTION_COLORS[s.section] ?? "bg-gray-400"}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Plataforma */}
            {(data.professionals || data.users !== undefined || data.conversations || data.reviews !== undefined) && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Plataforma</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {data.professionals && (
                    <>
                      <StatCard label="Profesionales" value={data.professionals.total} sub={`${data.professionals.active} activos`} />
                    </>
                  )}
                  {data.users !== undefined && (
                    <StatCard label="Usuarios registrados" value={data.users} />
                  )}
                  {data.conversations && (
                    <StatCard label="Conversaciones" value={data.conversations.total} sub={`${data.conversations.active} activas`} />
                  )}
                  {data.reviews !== undefined && (
                    <StatCard label="Reseñas" value={data.reviews} />
                  )}
                </div>
              </section>
            )}

            {/* Reportes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Por categoría */}
              {data.reportsByCategory.length > 0 && (
                <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Reportes por categoría
                      <span className="ml-2 text-gray-400 font-normal normal-case">({data.totalReports} total)</span>
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {data.reportsByCategory.map((r) => (
                      <Bar
                        key={r.category}
                        label={r.category.replace(/_/g, " ")}
                        value={r.count}
                        max={maxCategoryCount}
                        color="bg-purple-400"
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Por barrio */}
              {data.topBarrios.length > 0 && (
                <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Top barrios</h2>
                  </div>
                  <div className="space-y-3">
                    {data.topBarrios.map((b) => (
                      <Bar
                        key={b.barrio}
                        label={b.barrio}
                        value={b.count}
                        max={maxBarrioCount}
                        color="bg-amber-400"
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
