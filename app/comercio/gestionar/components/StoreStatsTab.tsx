"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Eye, MessageCircle, Package, Tag, TrendingUp, TrendingDown, Minus, Users, ThumbsUp, Star, CheckCircle, Circle, Zap, Sparkles, AlertTriangle, Info, Loader2 } from "lucide-react";
import type { AnalyticsData, ProfileScoreItem, AiRecommendation } from "@/lib/constants/storeConstants";
import { API_URL } from "@/lib/api/client";

interface Props {
  analytics: AnalyticsData | null;
  analyticsLoading: boolean;
  isDark: boolean;
  cardBg: string;
  textPri: string;
  textMuted: string;
  comercio?: { recommendations?: number; ratingAvg?: number; ratingCount?: number; _count?: { subscripciones?: number } };
  getToken: () => Promise<string | null>;
}

type Period = "7d" | "30d";

function useCountUp(target: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const steps = 24; const step = target / steps; let cur = 0;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(cur));
    }, 700 / steps);
    return () => clearInterval(t);
  }, [target]);
  return count;
}

function GradKpi({ label, value, gradient, icon: Icon, cur, prev }: { label:string; value:number; gradient:string; icon:React.ElementType; cur:number; prev:number }) {
  const n = useCountUp(value);
  const diff = prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null;
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white" />
        <div className="absolute -bottom-5 -left-3 w-16 h-16 rounded-full bg-white" />
      </div>
      <div className="relative">
        <Icon className="w-4 h-4 mb-2.5 opacity-80" />
        <p className="text-3xl font-black">{n.toLocaleString("es-AR")}</p>
        <p className="text-xs font-semibold mt-1 opacity-85">{label}</p>
        {diff !== null && (
          <div className="mt-1.5 flex items-center gap-1 text-xs font-bold opacity-80">
            {diff > 0 ? <><TrendingUp className="w-3 h-3"/>+{diff}%</> : diff < 0 ? <><TrendingDown className="w-3 h-3"/>{diff}%</> : <><Minus className="w-3 h-3"/>igual</>}
            <span className="font-normal">vs mes ant.</span>
          </div>
        )}
      </div>
    </div>
  );
}

const ChartTip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl px-3 py-2 text-xs shadow-xl border ${isDark ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p: any, i: number) => <p key={i} style={{ color: p.stroke ?? p.fill }}>{p.value} {p.name}</p>)}
    </div>
  );
};

function insights(a: AnalyticsData): string[] {
  const out: string[] = [];
  const views = a.thisMonth["profile_view"] ?? 0;
  const offers = a.thisMonth["offer_view"] ?? 0;
  if (a.conversionRate >= 10) out.push("Tu tasa de conversión es excelente — muchos visitantes te contactan directamente.");
  else if (a.conversionRate > 0 && a.conversionRate < 5) out.push("Conversión baja — mejorá tu descripción y agregá más productos.");
  const best = [...a.dayOfWeek].sort((x, y) => y.total - x.total)[0];
  if (best?.total > 0) { const m: Record<string,string> = {Lun:"lunes",Mar:"martes",Mié:"miércoles",Jue:"jueves",Vie:"viernes",Sáb:"sábados",Dom:"domingos"}; out.push(`Los ${m[best.day]??best.day} tenés más actividad — ideal para publicar novedades.`); }
  if (offers === 0 && views > 0) out.push("Tus ofertas tienen 0 vistas — publicá una oferta llamativa.");
  if (a.profileScore.score < 60) out.push("Completá tu perfil para aparecer mejor en búsquedas.");
  return out.slice(0, 3);
}

const PRIORITY_CONFIG = {
  urgente:     { label: "Urgente",     icon: AlertTriangle, color: "text-red-400",    bg: (dark: boolean) => dark ? "bg-red-500/10 border-red-500/20"    : "bg-red-50 border-red-100"    },
  recomendado: { label: "Recomendado", icon: Zap,           color: "text-amber-400",  bg: (dark: boolean) => dark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-100" },
  opcional:    { label: "Opcional",    icon: Info,          color: "text-blue-400",   bg: (dark: boolean) => dark ? "bg-blue-500/10 border-blue-500/20"   : "bg-blue-50 border-blue-100"   },
} as const;

export function StoreStatsTab({ analytics, analyticsLoading, isDark, cardBg, textPri, textMuted, comercio, getToken }: Props) {
  const [period, setPeriod] = useState<Period>("30d");
  const [aiRecs, setAiRecs] = useState<AiRecommendation[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  async function fetchRecommendations() {
    setAiLoading(true);
    setAiError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/comercios/me/recommendations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error ?? "Error al generar recomendaciones");
      }
      const data = await res.json() as { recomendaciones: AiRecommendation[] };
      setAiRecs(data.recomendaciones ?? []);
    } catch (e: any) {
      setAiError(e.message ?? "Error inesperado");
    } finally {
      setAiLoading(false);
    }
  }
  const card  = `rounded-2xl border p-5 ${cardBg}`;
  const chartC = isDark ? "#818cf8" : "#6366f1";
  const gridC  = isDark ? "#1f2937" : "#f1f5f9";
  const axisC  = isDark ? "#64748b" : "#94a3b8";

  if (analyticsLoading) return (
    <div className="space-y-4 pb-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(4)].map((_,i)=><div key={i} className={`h-28 rounded-2xl ${isDark?"bg-gray-800":"bg-gray-100"}`}/>)}</div>
      <div className={`h-56 rounded-2xl ${isDark?"bg-gray-800":"bg-gray-100"}`}/>
      <div className="grid grid-cols-2 gap-4">{[...Array(2)].map((_,i)=><div key={i} className={`h-48 rounded-2xl ${isDark?"bg-gray-800":"bg-gray-100"}`}/>)}</div>
    </div>
  );

  if (!analytics) return (
    <div className={`py-20 text-center rounded-2xl border ${cardBg}`}>
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isDark?"bg-indigo-500/10":"bg-indigo-50"}`}><TrendingUp className="w-7 h-7 text-indigo-400"/></div>
      <p className={`text-base font-bold ${textPri} mb-1`}>Sin datos aún</p>
      <p className={`text-sm max-w-xs mx-auto ${textMuted}`}>Las estadísticas aparecen cuando los usuarios visiten tu perfil.</p>
    </div>
  );

  const days   = period === "7d" ? 7 : 30;
  const cutoff = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);
  const dailyData = Object.entries(analytics.dailyLast30 ?? {}).filter(([d])=>d>=cutoff).sort(([a],[b])=>a.localeCompare(b)).map(([date,evts])=>({ label: new Date(date+"T12:00:00").toLocaleDateString("es-AR",{day:"numeric",month:"short"}), total: Object.values(evts).reduce((s,v)=>s+v,0) }));

  const METRICS = [
    { key:"profile_view",   label:"Visitas",   Icon:Eye,           g:"bg-gradient-to-br from-indigo-500 to-indigo-700" },
    { key:"whatsapp_click", label:"WhatsApp",  Icon:MessageCircle, g:"bg-gradient-to-br from-green-500 to-emerald-700"  },
    { key:"product_view",   label:"Productos", Icon:Package,       g:"bg-gradient-to-br from-blue-500 to-blue-700"      },
    { key:"offer_view",     label:"Ofertas",   Icon:Tag,           g:"bg-gradient-to-br from-amber-500 to-orange-600"   },
  ] as const;

  const { score, items } = analytics.profileScore ?? { score:0, items:[] };
  const scColor = score>=80?"text-green-400":score>=50?"text-amber-400":"text-red-400";
  const scGrad  = score>=80?"bg-gradient-to-br from-green-500 to-emerald-700":score>=50?"bg-gradient-to-br from-amber-500 to-orange-600":"bg-gradient-to-br from-red-500 to-red-700";
  const tips    = insights(analytics);

  return (
    <div className="space-y-4 pb-6">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {METRICS.map(({key,label,Icon,g})=>(
          <GradKpi key={key} label={label} value={(analytics.thisMonth??{})[key]??0} gradient={g} icon={Icon} cur={(analytics.thisMonth??{})[key]??0} prev={(analytics.lastMonth??{})[key]??0}/>
        ))}
      </div>

      <div className={card}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-400"/><h2 className={`text-sm font-bold ${textPri}`}>Actividad diaria</h2></div>
          <div className={`flex rounded-xl border p-0.5 text-xs font-semibold ${isDark?"border-gray-700 bg-gray-800":"border-gray-200 bg-gray-100"}`}>
            {(["7d","30d"] as Period[]).map(p=>(
              <button key={p} onClick={()=>setPeriod(p)} className={`px-3 py-1.5 rounded-lg transition-all ${period===p?"bg-indigo-500 text-white shadow-sm":isDark?"text-gray-400 hover:text-gray-200":"text-gray-500 hover:text-gray-700"}`}>{p==="7d"?"7 días":"30 días"}</button>
            ))}
          </div>
        </div>
        {dailyData.length>0?(
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData} margin={{top:4,right:4,left:-20,bottom:0}}>
              <defs><linearGradient id="stG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartC} stopOpacity={0.4}/><stop offset="95%" stopColor={chartC} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridC}/>
              <XAxis dataKey="label" tick={{fontSize:10,fill:axisC}} interval={period==="7d"?0:4}/>
              <YAxis tick={{fontSize:10,fill:axisC}} allowDecimals={false}/>
              <Tooltip content={<ChartTip isDark={isDark}/>}/>
              <Area type="monotone" dataKey="total" name="interacciones" stroke={chartC} strokeWidth={2.5} fill="url(#stG)" dot={{fill:chartC,r:3}} activeDot={{r:5}}/>
            </AreaChart>
          </ResponsiveContainer>
        ):(
          <div className={`flex items-center justify-center h-48 text-sm ${textMuted}`}>Sin actividad en los últimos {days} días</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={card}>
          <div className="flex items-center justify-between mb-3">
            <div><p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Salud del perfil</p><p className={`text-4xl font-black mt-1 ${scColor}`}>{score}<span className={`text-lg font-medium ${textMuted}`}>/100</span></p></div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg ${scGrad}`}>{score>=80?"A":score>=50?"B":"C"}</div>
          </div>
          <div className={`h-2.5 rounded-full mb-4 ${isDark?"bg-gray-800":"bg-gray-200"}`}><div className={`h-full rounded-full transition-all duration-700 ${score>=80?"bg-green-500":score>=50?"bg-amber-500":"bg-red-500"}`} style={{width:`${score}%`}}/></div>
          <div className="space-y-1.5">
            {(items as ProfileScoreItem[]).map(item=>(
              <div key={item.label} className={`flex items-center gap-2 py-1 px-2 rounded-lg ${!item.done?(isDark?"hover:bg-gray-800":"hover:bg-gray-50"):""}`}>
                {item.done?<CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0"/>:<Circle className={`w-4 h-4 flex-shrink-0 ${textMuted}`}/>}
                <span className={`text-xs flex-1 ${item.done?(isDark?"text-gray-300":"text-gray-700"):textMuted}`}>{item.label}</span>
                {!item.done&&<span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${isDark?"bg-gray-800 text-amber-400":"bg-amber-50 text-amber-600"}`}>+{item.points}pts</span>}
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-5 ${textMuted}`}>Embudo de conversión</p>
          <div className="flex flex-col gap-4">
            {[
              {label:"Visitas al perfil",   val:analytics.thisMonth["profile_view"]??0,   color:"#6366f1",bar:"bg-indigo-500"},
              {label:"Vistas de productos", val:analytics.thisMonth["product_view"]??0,   color:"#3b82f6",bar:"bg-blue-500"},
              {label:"Clicks en WhatsApp",  val:analytics.thisMonth["whatsapp_click"]??0, color:"#10b981",bar:"bg-emerald-500"},
            ].map(s=>{
              const max=analytics.thisMonth["profile_view"]||1;
              return(<div key={s.label}><div className="flex items-center justify-between mb-1.5"><span className={`text-xs ${textMuted}`}>{s.label}</span><span className="text-sm font-black" style={{color:s.color}}>{s.val}</span></div><div className={`h-2.5 rounded-full ${isDark?"bg-gray-800":"bg-gray-100"}`}><div className={`h-full rounded-full transition-all duration-700 ${s.bar}`} style={{width:`${Math.round((s.val/max)*100)}%`}}/></div></div>);
            })}
          </div>
          <div className={`mt-5 pt-4 border-t ${isDark?"border-gray-800":"border-gray-100"} flex items-center justify-between`}>
            <span className={`text-xs ${textMuted}`}>Tasa de conversión</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black ${analytics.conversionRate>=5?"text-green-400":analytics.conversionRate>0?"text-amber-400":textMuted}`}>{analytics.conversionRate}%</span>
              {analytics.conversionRate>=5&&<Zap className="w-4 h-4 text-green-400"/>}
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Recommendations ── */}
      <div className={card}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400"/>
            <h2 className={`text-sm font-bold ${textPri}`}>Plan de accion con IA</h2>
          </div>
          {!aiRecs && (
            <button
              onClick={fetchRecommendations}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3.5 h-3.5"/>}
              {aiLoading ? "Generando..." : "Generar plan"}
            </button>
          )}
          {aiRecs && (
            <button
              onClick={() => { setAiRecs(null); setAiError(null); }}
              className={`text-xs px-2 py-1 rounded-lg ${isDark ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"} transition-all`}
            >
              Regenerar
            </button>
          )}
        </div>

        {!aiRecs && !aiLoading && !aiError && (
          <div className={`rounded-xl p-4 text-center ${isDark ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
            <p className={`text-xs ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>
              La IA analiza tus metricas reales y te da 4 acciones concretas para crecer.
            </p>
          </div>
        )}

        {aiLoading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-7 h-7 text-indigo-400 animate-spin"/>
            <p className={`text-xs ${textMuted}`}>Analizando tu comercio...</p>
          </div>
        )}

        {aiError && (
          <div className={`rounded-xl p-3 text-xs ${isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-700"}`}>
            {aiError}
          </div>
        )}

        {aiRecs && aiRecs.length > 0 && (
          <div className="space-y-3">
            {aiRecs.map((rec, i) => {
              const cfg = PRIORITY_CONFIG[rec.prioridad as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.opcional;
              const PIcon = cfg.icon;
              return (
                <div key={i} className={`rounded-xl border p-3.5 ${cfg.bg(isDark)}`}>
                  <div className="flex items-start gap-2.5">
                    <PIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className={`text-sm font-bold leading-tight mb-1 ${textPri}`}>{rec.titulo}</p>
                      <p className={`text-xs leading-relaxed mb-1.5 ${textMuted}`}>{rec.accion}</p>
                      <div className={`flex items-center gap-1 text-xs font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                        <TrendingUp className="w-3 h-3"/>
                        <span>{rec.impacto}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={card}>
          <p className={`text-sm font-bold mb-4 ${textPri}`}>Actividad por día</p>
          {analytics.dayOfWeek?.some(d=>d.total>0)?(
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={analytics.dayOfWeek} margin={{top:4,right:4,left:-24,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridC}/>
                <XAxis dataKey="day" tick={{fontSize:10,fill:axisC}}/>
                <YAxis tick={{fontSize:10,fill:axisC}} allowDecimals={false}/>
                <Tooltip content={<ChartTip isDark={isDark}/>}/>
                <Bar dataKey="total" name="interacciones" fill={chartC} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ):(
            <div className={`flex items-center justify-center h-40 text-sm ${textMuted}`}>Sin datos aún</div>
          )}
        </div>

        <div className={card}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${textMuted}`}>Prueba social</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              {Icon:Users,    val:comercio?._count?.subscripciones??0,                                 label:"Suscriptores",    c:"text-blue-400",   bg:isDark?"bg-blue-500/10":"bg-blue-50"},
              {Icon:ThumbsUp, val:comercio?.recommendations??0,                                     label:"Recomendaciones", c:"text-amber-400",  bg:isDark?"bg-amber-500/10":"bg-amber-50"},
              {Icon:Star,     val:comercio?.ratingAvg?parseFloat(comercio.ratingAvg.toFixed(1)):0, label:comercio?.ratingCount?`${comercio.ratingCount} reseñas`:"Sin reseñas", c:"text-yellow-400", bg:isDark?"bg-yellow-500/10":"bg-yellow-50"},
            ].map(({Icon,val,label,c,bg})=>(
              <div key={label} className={`rounded-xl p-3 text-center ${bg}`}>
                <Icon className={`w-4 h-4 mx-auto mb-1.5 ${c}`}/>
                <p className={`text-xl font-black ${textPri}`}>{val===0?"—":val}</p>
                <p className={`text-[10px] mt-0.5 ${textMuted} leading-tight`}>{label}</p>
              </div>
            ))}
          </div>
          {tips.length>0&&(
            <div className="space-y-2">
              {tips.map((txt,i)=>(
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl text-xs leading-relaxed ${isDark?"bg-indigo-500/10 text-indigo-300":"bg-indigo-50 text-indigo-800"}`}>
                  <Zap className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-indigo-400"/>{txt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
