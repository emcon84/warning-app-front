"use client";

import { BarChart2, Eye, MessageCircle, Package, Tag } from "lucide-react";
import { StoreAnalyticsChart } from "./StoreAnalyticsChart";
import type { AnalyticsData } from "../../../lib/constants/storeConstants";

interface Props {
  analytics: AnalyticsData | null;
  analyticsLoading: boolean;
  isDark: boolean;
  cardBg: string;
  textPri: string;
  textMuted: string;
}

export function StoreStatsTab({ analytics, analyticsLoading, isDark, cardBg, textPri, textMuted }: Props) {
  return (
    <div className="px-4 py-5 space-y-6">
      <div>
        <p className={`text-base font-bold ${textPri}`}>Estadísticas</p>
        <p className={`text-xs mt-0.5 ${textMuted}`}>Rendimiento de tu comercio este mes</p>
      </div>

      {analyticsLoading && (
        <div className="flex justify-center py-12">
          <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isDark ? "border-gray-600" : "border-gray-300"}`} />
        </div>
      )}

      {!analyticsLoading && analytics && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: "profile_view",   label: "Visitas al perfil",    Icon: Eye,           color: "text-indigo-400" },
              { key: "whatsapp_click", label: "Clicks en WhatsApp",   Icon: MessageCircle, color: "text-green-400" },
              { key: "product_view",   label: "Vistas de productos",  Icon: Package,       color: "text-blue-400" },
              { key: "offer_view",     label: "Vistas de ofertas",    Icon: Tag,           color: "text-amber-400" },
            ] as const).map(({ key, label, Icon, color }) => {
              const current = (analytics.thisMonth ?? {})[key] ?? 0;
              const prev = (analytics.lastMonth ?? {})[key] ?? 0;
              const pct = prev === 0 ? null : Math.round(((current - prev) / prev) * 100);
              const up = pct !== null && pct >= 0;
              return (
                <div key={key} className={`rounded-2xl border p-4 ${cardBg}`}>
                  <Icon className={`w-5 h-5 mb-2 ${color}`} />
                  <p className={`text-2xl font-black ${textPri}`}>{current}</p>
                  <p className={`text-xs ${textMuted} mt-0.5`}>{label}</p>
                  {pct !== null && (
                    <p className={`text-xs font-semibold mt-1 ${up ? "text-green-500" : "text-red-400"}`}>
                      {up ? "+" : ""}{pct}% vs mes anterior
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`rounded-2xl border p-4 ${cardBg}`}>
            <p className={`text-sm font-semibold mb-4 ${textPri}`}>Últimos 30 días</p>
            <StoreAnalyticsChart data={analytics.dailyLast30} isDark={isDark} />
          </div>
        </>
      )}

      {!analyticsLoading && !analytics && (
        <div className={`py-12 text-center rounded-2xl border ${cardBg}`}>
          <BarChart2 className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
          <p className={`text-sm ${textMuted}`}>No hay datos aún.</p>
        </div>
      )}
    </div>
  );
}
