"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Users, FileText, MapPin, ArrowLeft, TrendingUp, Sun, Moon, Briefcase, MessageSquare, Star } from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

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

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: number | string; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 dark:text-white">{typeof value === "number" ? value.toLocaleString("es-AR") : value}</p>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl px-3 py-2 text-xs shadow-lg border ${isDark ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.value} {p.name}</p>
      ))}
    </div>
  );
};

export default function StatsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/analytics`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const chartColor   = isDark ? "#818cf8" : "#6366f1";
  const gridColor    = isDark ? "#1f2937" : "#f3f4f6";
  const axisColor    = isDark ? "#6b7280" : "#9ca3af";
  const barColor     = isDark ? "#a78bfa" : "#7c3aed";
  const cardBg       = "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5";

  const dailyData = (data?.dailyVisits ?? []).map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
  }));

  const categoryData = (data?.reportsByCategory ?? [])
    .map(r => ({ name: r.category.replace(/_/g, " "), value: r.count }))
    .sort((a, b) => b.value - a.value);

  const barrioData = (data?.topBarrios ?? [])
    .map(b => ({ name: b.barrio, value: b.count }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <Link href="/app" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Reportes Reconquista</p>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
            No se pudo cargar el dashboard.
          </div>
        )}

        {data && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Reportes totales"  value={data.totalReports}                icon={FileText}     color="bg-indigo-500" />
              <KpiCard label="Profesionales"     value={data.professionals?.total ?? 0}   icon={Briefcase}    color="bg-emerald-500" sub={`${data.professionals?.active ?? 0} activos`} />
              <KpiCard label="Conversaciones"    value={data.conversations?.total ?? 0}   icon={MessageSquare} color="bg-blue-500" />
              <KpiCard label="Reseñas"           value={data.reviews ?? 0}                icon={Star}         color="bg-amber-500" />
            </div>

            {/* Tendencia diaria */}
            {dailyData.length > 0 && (
              <div className={cardBg}>
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">Reportes — últimos 30 días</h2>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="statsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={chartColor} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: axisColor }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Area type="monotone" dataKey="visits" name="reportes" stroke={chartColor} strokeWidth={2} fill="url(#statsGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Categorías + Barrios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* BarChart horizontal — categorías */}
              {categoryData.length > 0 && (
                <div className={cardBg}>
                  <div className="flex items-center gap-2 mb-5">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">Por categoría</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={Math.max(categoryData.length * 36, 160)}>
                    <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: axisColor }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: axisColor }} width={100} />
                      <Tooltip content={<CustomTooltip isDark={isDark} />} />
                      <Bar dataKey="value" name="reportes" fill={barColor} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* PieChart — barrios */}
              {barrioData.length > 0 && (
                <div className={cardBg}>
                  <div className="flex items-center gap-2 mb-5">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">Top barrios</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={barrioData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {barrioData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip isDark={isDark} />} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span style={{ fontSize: 11, color: axisColor }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
