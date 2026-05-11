"use client";

import { X, Check } from "lucide-react";
import type { PlanInfo } from "../../../lib/constants/storeConstants";

interface Props {
  isDark: boolean;
  currentPlan: string;
  planInfo: PlanInfo | null;
  onClose: () => void;
}

export function StorePlanModal({ isDark, currentPlan, planInfo, onClose }: Props) {
  const bg = isDark ? "bg-gray-900" : "bg-white";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textSec = isDark ? "text-gray-400" : "text-gray-600";
  const textMuted = isDark ? "text-gray-500" : "text-gray-400";
  const border = isDark ? "border-gray-700" : "border-gray-200";

  const plans = [
    {
      id: "free",
      name: "Gratis",
      price: "0",
      features: [
        "Hasta 50 productos",
        "2 fotos con IA por día",
        "Perfil básico",
        "Posición estándar",
      ],
      current: currentPlan === "free",
    },
    {
      id: "premium",
      name: "Premium",
      price: "U$5/mes",
      features: [
        "Hasta 100 productos",
        "20 fotos con IA por día",
        "Perfil destacado",
        "Posición preferente",
        "Más visibilidad en el listado",
      ],
      popular: true,
    },
    {
      id: "master",
      name: "Master",
      price: "U$10/mes",
      features: [
        "Productos ilimitados",
        "IA ilimitada",
        "Perfil premium",
        "Posición primera garantizada",
        "Insignia Founder permanente",
        "Soporte prioritario",
      ],
    },
  ];

  function getUsageText() {
    if (!planInfo) return "";
    const { usage, limits } = planInfo;
    if (typeof limits.totalProducts === "number") {
      return `${usage.productos}/${limits.totalProducts} productos`;
    }
    return `${usage.productos} productos`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 py-20">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative rounded-3xl ${bg} max-w-lg w-full max-h-[75vh] overflow-y-auto p-4`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className={`text-lg font-black mb-1 ${textPri}`}>Elegí tu plan</h2>
        <p className={`text-xs mb-3 ${textSec}`}>Tu uso actual: {getUsageText()}</p>

        <div className="flex flex-col gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-3 ${
                plan.current
                  ? "border-indigo-500 bg-indigo-500/10"
                  : (plan as any).popular
                  ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
                  : border
              }`}
            >
              {(plan as any).popular && (
                <span className="absolute -top-2 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500 text-white">
                  Más popular
                </span>
              )}
              {plan.current && (
                <span className="absolute -top-2 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white">
                  Tu plan
                </span>
              )}

              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className={`font-bold text-base ${textPri}`}>{plan.name}</h3>
                  <p className={`text-lg font-black ${plan.id === "free" ? textMuted : "text-indigo-500"}`}>
                    {plan.price}
                  </p>
                </div>
                {!plan.current && (
                  <a
                    href={`https://wa.me/3482445015?text=${encodeURIComponent(
                      plan.id === "premium"
                        ? "Hola! Quiero activar el plan Premium para mi comercio en Reportes Reconquista."
                        : "Hola! Quiero información sobre el plan Master para mi comercio."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                  >
                    Elegir
                  </a>
                )}
              </div>

              <ul className="space-y-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className={`flex items-center gap-2 text-xs ${textSec}`}>
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className={`text-xs mt-3 text-center ${textMuted}`}>
          ¿Necesitás algo diferente? Escribinos y armamos un plan a tu medida.
        </p>
      </div>
    </div>
  );
}
