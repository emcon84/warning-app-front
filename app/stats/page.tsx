"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { ArrowLeft, Sun, Moon, FileText, Users, MessageSquare, Star, TrendingUp, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const CATEGORY_COLORS: Record<string, string> = {
  arboles:      "#10b981",
  baches:       "#f59e0b",
  luminarias:   "#6366f1",
  basura:       "#ef4444",
  inundaciones: "#06b6d4",
  animales:     "#8b5cf6",
  otros:        "#64748b",
};
const PALETTE = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6"];

type Period = "7d" | "30d";

interface Analytics {
  totalReports: number;
  dailyVisits: { date: string; visits: number }[];
  reportsByCategory: { category: string; count: number }[];
  topBarrios: { barrio: string; count: number }[];
  professionals?: { total: number; active: number };
  conversations?: { total: number; active: number };
  reviews?: number;
}

function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const steps = 30;
    const step  = target / steps;
    let cur = 0;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(cur));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function KpiCard({ label, value, sub, gradient, icon: Icon }: {
  label: string; value: number; sub?: string; gradient: string; icon: React.ElementType;
}) {
  const animated = useCountUp(value);
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white ${gradient} shadow-lg`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white" />
        <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white" />
      </div>
      <div className="relative">
        <Icon className="w-5 h-5 mb-3 opacity-90" />
        <p className="text-3xl font-black tracking-tight">{animated.toLocaleString("es-AR")}</p>
        <p className="text-sm font-semibold mt-1 opacity-90">{label}</p>
        {sub && <p className="text-xs mt-0.5 opacity-60">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl px-3 py-2.5 text-xs shadow-xl border ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>
      <p className={`font-bold mb-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-medium" style={{ color: p.color ?? p.fill }}>
          {p.value} {p.name}
        </p>
      ))}
    </div>
  );
};

export default function StatsPage() {
  const [data,    setData]    = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [period,  setPeriod]  = useState<Period>("30d");
  const [selCategory, setSelCategory] = useState<string | null>(null);
  const { isDark, toggleTheme } = useTheme();

  const fetchData = useCallback(() => {
    setLoading(true); setError(false);
    fetch(`${API_BASE_URL}/api/analytics`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived data ─────────────────────────────────────────────────────────────

  const days = period === "7d" ? 7 : 30;
  const cutoff = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);

  const dailyData = (data?.dailyVisits ?? [])
    .filter(d => d.date >= cutoff)
    .map(d => ({
      label: new Date(d.date + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
      reportes: d.visits,
    }));

  const categoryData = (data?.reportsByCategory ?? [])
    .map((r, i) => ({
      name: r.category.replace(/_/g, " "),
      value: r.count,
      color: CATEGORY_COLORS[r.category] ?? PALETTE[i % PALETTE.length],
      active: selCategory === null || selCategory === r.category,
    }))
    .sort((a, b) => b.value - a.value);

  const barrioData = (data?.topBarrios ?? []).map((b, i) => ({
    name: b.barrio,
    value: b.count,
    color: PALETTE[i % PALETTE.length],
  }));

  // ── Styles ───────────────────────────────────────────────────────────────────

  const bg      = isDark ? "bg-gray-950" : "bg-slate-50";
  const card    = `rounded-2xl border p-5 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-sm"}`;
  const chartC  = isDark ? "#818cf8" : "#6366f1";
  const gridC   = isDark ? "#1f2937" : "#f1f5f9";
  const axisC   = isDark ? "#64748b" : "#94a3b8";

  return (
    <div className={`min-h-screen ${bg}`}>

      {/* ── Navbar ── */}
      <div className={`sticky top-0 z-20 border-b px-4 py-3 flex items-center gap-3 ${isDark ? "bg-gray-950/90 border-gray-800 backdrop-blur-sm" : "bg-white/90 border-gray-200 backdrop-blur-sm"}`}>
        <Link href="/app" className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Dashboard</h1>
          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Reportes Reconquista</p>
        </div>
        <button onClick={fetchData} className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        <button onClick={toggleTheme} className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* ── Loading ── */}
        {loading && !data && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-8 h-8 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin" />
            <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>Cargando estadísticas...</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className={`flex flex-col items-center justify-center h-64 gap-4 ${card}`}>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>No se pudo cargar el dashboard.</p>
            <button onClick={fetchData} className="px-4 py-2 text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors">
              Reintentar
            </button>
          </div>
        )}

        {data && (
          <>
            {/* ── KPIs ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Reportes"       value={data.totalReports}              icon={FileText}      gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" />
              <KpiCard label="Profesionales"  value={data.professionals?.total ?? 0} icon={Users}         gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" sub={`${data.professionals?.active ?? 0} activos`} />
              <KpiCard label="Conversaciones" value={data.conversations?.total ?? 0} icon={MessageSquare} gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
              <KpiCard label="Reseñas"        value={data.reviews ?? 0}              icon={Star}          gradient="bg-gradient-to-br from-amber-500 to-amber-600" />
            </div>

            {/* ── Tendencia + Period selector ── */}
            <div className={card}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <h2 className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-800"}`}>Reportes por día</h2>
                </div>
                <div className={`flex rounded-xl border p-0.5 text-xs font-semibold ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-100"}`}>
                  {(["7d","30d"] as Period[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${period === p
                        ? "bg-indigo-500 text-white shadow-sm"
                        : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {p === "7d" ? "7 días" : "30 días"}
                    </button>
                  ))}
                </div>
              </div>

              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={chartC} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={chartC} stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridC} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisC }} interval={period === "7d" ? 0 : 4} />
                    <YAxis tick={{ fontSize: 10, fill: axisC }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Area type="monotone" dataKey="reportes" stroke={chartC} strokeWidth={2.5} fill="url(#grad1)" dot={{ fill: chartC, r: 3 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className={`flex items-center justify-center h-48 text-sm ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                  Sin reportes en los últimos {days} días
                </div>
              )}
            </div>

            {/* ── Categorías + Barrios ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Categorías — BarChart interactivo */}
              <div className={card}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <h2 className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-800"}`}>Por categoría</h2>
                  </div>
                  {selCategory && (
                    <button
                      onClick={() => setSelCategory(null)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      Ver todas
                    </button>
                  )}
                </div>

                {categoryData.length > 0 ? (
                  <div className="space-y-2.5">
                    {categoryData.map(cat => {
                      const max = Math.max(...categoryData.map(c => c.value), 1);
                      const pct = Math.round((cat.value / max) * 100);
                      const isActive = selCategory === null || selCategory === cat.name;
                      return (
                        <button
                          key={cat.name}
                          onClick={() => setSelCategory(selCategory === cat.name ? null : cat.name)}
                          className={`w-full text-left transition-all rounded-xl p-2 -mx-2 ${
                            isActive ? "opacity-100" : "opacity-30"
                          } ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}
                        >
                          <div className="flex items-center justify-between mb-1.5 px-0.5">
                            <span className={`text-xs font-semibold capitalize ${isDark ? "text-gray-300" : "text-gray-700"}`}>{cat.name}</span>
                            <span className="text-xs font-black" style={{ color: cat.color }}>{cat.value}</span>
                          </div>
                          <div className={`h-2 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: cat.color }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`flex items-center justify-center h-40 text-sm ${isDark ? "text-gray-600" : "text-gray-400"}`}>Sin datos</div>
                )}
              </div>

              {/* Barrios — PieChart */}
              <div className={card}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 rounded-full bg-amber-400 flex-shrink-0" />
                  <h2 className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-800"}`}>Top barrios</h2>
                </div>

                {barrioData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={barrioData}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                          nameKey="name"
                          onClick={(d) => setSelCategory(null)}
                        >
                          {barrioData.map((b, i) => (
                            <Cell key={i} fill={b.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip isDark={isDark} />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
                      {barrioData.map((b) => (
                        <div key={b.name} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
                          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>{b.name}</span>
                          <span className="text-xs font-bold" style={{ color: b.color }}>{b.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={`flex items-center justify-center h-40 text-sm ${isDark ? "text-gray-600" : "text-gray-400"}`}>Sin datos</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
