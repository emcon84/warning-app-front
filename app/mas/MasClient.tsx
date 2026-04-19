"use client";

import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useTheme } from "../contexts/ThemeContext";
import { Pill, ShoppingCart, Map, TriangleAlert, ChevronRight } from "lucide-react";

const ITEMS = [
  {
    label: "Ofertas",
    description: "Descuentos y promociones de supermercados locales",
    Icon: ShoppingCart,
    href: "/ofertas",
    color: "text-orange-500",
    iconBg: "bg-orange-500/10",
  },
  {
    label: "Farmacias de turno",
    description: "Encontra la farmacia de guardia mas cercana",
    Icon: Pill,
    href: "/app?view=farmacias",
    color: "text-green-500",
    iconBg: "bg-green-500/10",
  },
  {
    label: "Mapa de reportes",
    description: "Reportes ciudadanos geolocalizados en tiempo real",
    Icon: Map,
    href: "/app?view=reports",
    color: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    label: "Hacer un reporte",
    description: "Reporta un problema en la via publica",
    Icon: TriangleAlert,
    href: "/app?view=reports",
    color: "text-red-500",
    iconBg: "bg-red-500/10",
  },
];

export default function MasClient() {
  const router = useRouter();
  const { isDark } = useTheme();

  const bg          = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSec     = isDark ? "text-gray-400" : "text-gray-500";
  const cardBg      = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <Navbar sidebarDisabled />

      <div className="max-w-xl mx-auto px-4 pt-20 pb-32">

        <div className="mb-6 mt-2">
          <h1 className={`text-xl font-bold ${textPrimary}`}>Mas servicios</h1>
          <p className={`text-sm mt-1 ${textSec}`}>Todo lo que necesitas en un solo lugar</p>
        </div>

        <div className="flex flex-col gap-3">
          {ITEMS.map(({ label, description, Icon, href, color, iconBg }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className={`w-full text-left p-4 rounded-2xl border transition-colors ${cardBg} ${
                isDark ? "hover:border-gray-700" : "hover:border-gray-300"
              } active:scale-[0.99]`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${textPrimary}`}>{label}</p>
                  <p className={`text-xs mt-0.5 ${textSec}`}>{description}</p>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
