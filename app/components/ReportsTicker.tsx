"use client";

import { useEffect, useState, useRef } from "react";
import { getCategoryIcon, getCategoryLabel } from "../utils/categoryHelpers";
import { Report, ReportCategory } from "../types";

interface ReportsTickerProps {
  reports: Report[];
  onReportClick?: (report: Report) => void;
}

type AnimState = "entering" | "visible" | "leaving" | "hidden";

const VISIBLE_MS = 4500;
const TRANSITION_MS = 420;

export default function ReportsTicker({ reports, onReportClick }: ReportsTickerProps) {
  const [index, setIndex] = useState(0);
  const [animState, setAnimState] = useState<AnimState>("hidden");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Solo reportes de hoy
  const today = new Date();
  const isToday = (date: Date | string) => {
    const d = new Date(date);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };
  const recent = reports
    .filter((r) => isToday(r.createdAt))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  const clear = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  const advance = () => {
    setAnimState("leaving");
    timerRef.current = setTimeout(() => {
      setAnimState("hidden");
      timerRef.current = setTimeout(() => {
        setIndex((i) => (i + 1) % recent.length);
        setAnimState("entering");
        timerRef.current = setTimeout(() => {
          setAnimState("visible");
          timerRef.current = setTimeout(advance, VISIBLE_MS);
        }, 30);
      }, 60);
    }, TRANSITION_MS);
  };

  useEffect(() => {
    if (recent.length === 0) return;
    setIndex(0);
    if (recent.length === 1) {
      // Un solo reporte: mostrar estático, sin ciclo
      setAnimState("entering");
      const t = setTimeout(() => setAnimState("visible"), 30);
      return () => clearTimeout(t);
    }
    setAnimState("entering");
    const t1 = setTimeout(() => {
      setAnimState("visible");
      timerRef.current = setTimeout(advance, VISIBLE_MS);
    }, 30);
    return () => { clear(); clearTimeout(t1); };
  }, [reports.length]);

  if (recent.length === 0) return null;

  const report = recent[index];
  if (!report) return null;

  const Icon = getCategoryIcon(report.category as ReportCategory);
  const label = getCategoryLabel(report.category as ReportCategory);
  const location = report.direccion && report.direccion !== "Sin especificar"
    ? report.direccion
    : report.barrio && report.barrio !== "Sin especificar"
    ? report.barrio
    : null;

  const translate =
    animState === "entering" ? "translate-x-full opacity-0"
    : animState === "visible" ? "translate-x-0 opacity-100"
    : animState === "leaving" ? "-translate-x-full opacity-0"
    : "translate-x-full opacity-0";

  return (
    <div className="fixed bottom-[4.5rem] left-3 right-3 z-[900] pointer-events-none flex justify-center">
      <button
        onClick={() => onReportClick?.(report)}
        className={`
          pointer-events-auto w-full max-w-sm
          flex items-center gap-3 px-4 py-3
          rounded-2xl shadow-xl
          bg-white/90 dark:bg-gray-900/90 backdrop-blur-md
          border border-gray-200/60 dark:border-gray-700/60
          transition-all duration-[420ms] ease-in-out
          ${translate}
        `}
        style={{ willChange: "transform, opacity" }}
      >
        {Icon && (
          <span className="shrink-0 w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </span>
        )}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-none mb-0.5">
            {label}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate leading-snug">
            {report.description}
          </p>
          {location && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
              {location}
            </p>
          )}
        </div>
        <span className="shrink-0 text-[10px] text-gray-300 dark:text-gray-600 font-medium">
          {index + 1}/{recent.length}
        </span>
      </button>
    </div>
  );
}
