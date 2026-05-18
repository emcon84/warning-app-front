"use client";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Eye, MessageCircle, Package, Tag, TrendingUp, TrendingDown, Minus, Users, ThumbsUp, Star, CheckCircle, Circle, ChevronRight } from "lucide-react";
import type { AnalyticsData, ProfileScoreItem } from "@/lib/constants/storeConstants";

interface Props {
  analytics: AnalyticsData | null;
  analyticsLoading: boolean;
  isDark: boolean;
  cardBg: string;
  textPri: string;
  textMuted: string;
  comercio?: { recommendations?: number; ratingAvg?: number; ratingCount?: number; _count?: { suscriptores?: number } };
}

const METRICS = [
  { key: "profile_view",   label: "Visitas al perfil",   Icon: Eye,           color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { key: "whatsapp_click", label: "Clicks en WhatsApp",  Icon: MessageCircle, color: "text-green-400",  bg: "bg-green-500/10"  },
  { key: "product_view",   label: "Vistas de productos", Icon: Package,       color: "text-blue-400",   bg: "bg-blue-500/10"   },
  { key: "offer_view",     label: "Vistas de ofertas",   Icon: Tag,           color: "text-amber-400",  bg: "bg-amber-500/10"  },
] as const;

function Pct({ current, prev }: { current: number; prev: number }) {
  if (prev === 0) return null;
  const pct = Math.round(((current - prev) / prev) * 100);
  if (pct === 0) return <span className="text-xs text-gray-400 flex items-center gap-0.5"><Minus className="w-3 h-3" />sin cambios</span>;
  return pct > 0
    ? <span className="text-xs text-green-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />+{pct}%</span>
    : <span className="text-xs text-red-400 flex items-center gap-0.5"><TrendingDown className="w-3 h-3" />{pct}%</span>;
}

function ScoreBar({ score, isDark }: { score: number; isDark: boolean }) {
  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className={`h-2 rounded-full w-full ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

function generateInsights(analytics: AnalyticsData): string[] {
  const insights: string[] = [];
  const offerViews = analytics.thisMonth["offer_view"]  ?? 0;
  const prodViews  = analytics.thisMonth["product_view"] ?? 0;
  const views      = analytics.thisMonth["profile_view"] ?? 0;

  if (analytics.conversionRate >= 10)
    insights.push("Tu tasa de conversión es excelente — muchos visitantes te contactan directamente.");
  else if (analytics.conversionRate > 0 && analytics.conversionRate < 5)
    insights.push("Tu conversión es baja — mejorá tu descripción y agregá más productos para captar más contactos.");

  const bestDay = [...analytics.dayOfWeek].sort((a, b) => b.total - a.total)[0];
  if (bestDay && bestDay.total > 0) {
    const labels: Record<string, string> = { Lun: "lunes", Mar: "martes", Mié: "miércoles", Jue: "jueves", Vie: "viernes", Sáb: "sábados", Dom: "domingos" };
    insights.push(`Los ${labels[bestDay.day] ?? bestDay.day} tenés más actividad — ideal para publicar novedades u ofertas.`);
  }

  if (offerViews === 0 && views > 0)
    insights.push("Tus ofertas tienen 0 vistas — publicá una oferta llamativa para captar más atención.");

  if (prodViews > views && views > 0)
    insights.push("Tus productos generan mucho interés — asegurate de tener precios y fotos actualizados.");

  if (analytics.profileScore.score < 60)
    insights.push("Completá tu perfil para aparecer mejor posicionado en los resultados de búsqueda.");

  return insights.slice(0, 3);
}

export function StoreStatsTab({ analytics, analyticsLoading, isDark, cardBg, textPri, textMuted, comercio }: Props) {
  const card = `rounded-2xl border p-5 ${cardBg}`;

  if (analyticsLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isDark ? "border-gray-600" : "border-gray-300"}`} />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`py-16 text-center rounded-2xl border ${cardBg}`}>
        <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
        <p className={`text-sm ${textMuted}`}>No hay datos aún. Las estadísticas aparecen cuando los usuarios visiten tu perfil.</p>
      </div>
    );
  }

  const insights = generateInsights(analytics);
  const { score, items } = analytics.profileScore ?? { score: 0, items: [] };
  const scoreColor = score >= 80 ? "text-green-400" : score >= 50 ? "text-amber-400" : "text-red-400";
  const chartColor = isDark ? "#a78bfa" : "#7c3aed";
  const gridColor  = isDark ? "#1f2937" : "#f3f4f6";
  const axisColor  = isDark ? "#6b7280" : "#9ca3af";

  return (
    <div className="space-y-4 pb-6">

      {/* Score + Conversión */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className={card}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Salud del perfil</p>
              <p className={`text-3xl font-black mt-1 ${scoreColor}`}>
                {score}<span className={`text-base font-medium ${textMuted}`}>/100</span>
              </p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${
              score >= 80 ? "bg-green-500/15 text-green-400" : score >= 50 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"
            }`}>
              {score >= 80 ? "A" : score >= 50 ? "B" : "C"}
            </div>
          </div>
          <ScoreBar score={score} isDark={isDark} />
          <div className="mt-3 space-y-1.5">
            {(items as ProfileScoreItem[]).map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                {item.done
                  ? <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  : <Circle className={`w-3.5 h-3.5 flex-shrink-0 ${textMuted}`} />}
                <span className={`text-xs ${item.done ? (isDark ? "text-gray-300" : "text-gray-700") : textMuted}`}>{item.label}</span>
                {!item.done && <span className={`ml-auto text-xs font-semibold ${textMuted}`}>+{item.points}pts</span>}
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${textMuted}`}>Embudo de conversión</p>
          <div className="flex flex-col gap-3">
            {[
              { label: "Visitas al perfil",   value: analytics.thisMonth["profile_view"]   ?? 0, color: "bg-indigo-500" },
              { label: "Vistas de productos", value: analytics.thisMonth["product_view"]   ?? 0, color: "bg-blue-500"   },
              { label: "Clicks en WhatsApp",  value: analytics.thisMonth["whatsapp_click"] ?? 0, color: "bg-green-500"  },
            ].map((step) => {
              const max = analytics.thisMonth["profile_view"] || 1;
              const pct = Math.round((step.value / max) * 100);
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs ${textMuted}`}>{step.label}</span>
                    <span className={`text-sm font-bold ${textPri}`}>{step.value}</span>
                  </div>
                  <div className={`h-2 rounded-full w-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                    <div className={`h-full rounded-full ${step.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className={`mt-4 pt-4 border-t ${isDark ? "border-gray-800" : "border-gray-100"} flex items-center justify-between`}>
            <span className={`text-xs ${textMuted}`}>Tasa de conversión este mes</span>
            <span className={`text-xl font-black ${
              analytics.conversionRate >= 5 ? "text-green-400" : analytics.conversionRate > 0 ? "text-amber-400" : textMuted
            }`}>
              {analytics.conversionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* 4 métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {METRICS.map(({ key, label, Icon, color, bg }) => {
          const current = (analytics.thisMonth ?? {})[key] ?? 0;
          const prev    = (analytics.lastMonth ?? {})[key] ?? 0;
          return (
            <div key={key} className={card}>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl font-black ${textPri}`}>{current}</p>
              <p className={`text-xs mt-0.5 mb-2 ${textMuted}`}>{label}</p>
              <Pct current={current} prev={prev} />
            </div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={card}>
          <p className={`text-sm font-semibold mb-4 ${textPri}`}>Tendencia semanal</p>
          {analytics.weeklyData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={analytics.weeklyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: axisColor }} tickFormatter={v => `S${v.slice(8)}`} />
                <YAxis tick={{ fontSize: 10, fill: axisColor }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: isDark ? "#111827" : "#fff", border: "none", borderRadius: 12, fontSize: 12 }}
                  labelFormatter={v => `Semana del ${v}`}
                />
                <Area type="monotone" dataKey="total" stroke={chartColor} strokeWidth={2} fill="url(#grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className={`flex items-center justify-center h-40 ${textMuted} text-sm`}>Sin datos aún</div>
          )}
        </div>

        <div className={card}>
          <p className={`text-sm font-semibold mb-4 ${textPri}`}>Actividad por día</p>
          {analytics.dayOfWeek?.some(d => d.total > 0) ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={analytics.dayOfWeek} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: axisColor }} />
                <YAxis tick={{ fontSize: 10, fill: axisColor }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: isDark ? "#111827" : "#fff", border: "none", borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="total" fill={chartColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`flex items-center justify-center h-40 ${textMuted} text-sm`}>Sin datos aún</div>
          )}
        </div>
      </div>

      {/* Prueba social + Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={card}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${textMuted}`}>Prueba social</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { Icon: Users,    value: comercio?._count?.suscriptores ?? 0,                          label: "Suscriptores",     iconClass: textMuted       },
              { Icon: ThumbsUp, value: comercio?.recommendations ?? 0,                                 label: "Recomendaciones",  iconClass: "text-amber-400"},
              { Icon: Star,     value: comercio?.ratingAvg ? comercio.ratingAvg.toFixed(1) : "—",      label: comercio?.ratingCount ? `${comercio.ratingCount} reseñas` : "Sin reseñas", iconClass: "text-yellow-400" },
            ].map(({ Icon, value, label, iconClass }) => (
              <div key={label}>
                <Icon className={`w-5 h-5 mx-auto mb-1 ${iconClass}`} />
                <p className={`text-xl font-black ${textPri}`}>{value}</p>
                <p className={`text-xs mt-0.5 ${textMuted}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {insights.length > 0 && (
          <div className={card}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>Insights</p>
            <div className="space-y-2">
              {insights.map((txt, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl ${isDark ? "bg-gray-800/60" : "bg-gray-50"}`}>
                  <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-indigo-400" />
                  <p className={`text-xs leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{txt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
