"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Pill } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { TurnoResponse } from "@/types";

interface Props {
  turno: TurnoResponse | null;
}

export function HomeTurnoBanner({ turno }: Props) {
  const { isDark } = useTheme();

  if (!turno || turno.farmacias.length === 0) return null;

  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textMuted   = isDark ? "text-gray-500" : "text-gray-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
      className="mb-8"
    >
      <div className={`rounded-2xl border p-4 ${isDark ? "bg-green-950/40 border-green-900" : "bg-green-50 border-green-200"}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center">
              <Pill className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-600">Farmacia de turno</p>
              <p className={`text-xs ${textMuted}`}>{turno.fecha}</p>
            </div>
          </div>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:flex-wrap gap-2">
          {turno.farmacias.slice(0, 3).map((farmacia) => (
            <div
              key={farmacia.id}
              className={`rounded-xl p-3 border md:flex-1 md:min-w-[280px] ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
            >
              <p className={`text-sm font-semibold ${textPrimary}`}>{farmacia.nombre}</p>
              <div className={`flex items-center gap-1 mt-0.5 ${textMuted}`}>
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs">{farmacia.direccion}</span>
              </div>
              {farmacia.telefono && (
                <a
                  href={`tel:${farmacia.telefono}`}
                  className="inline-flex items-center gap-1 mt-1.5 text-xs text-green-600 font-medium"
                >
                  <Phone className="w-3 h-3" />
                  {farmacia.telefono}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
