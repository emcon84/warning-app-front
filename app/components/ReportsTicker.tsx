"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Megaphone } from "lucide-react";
import { getCategoryIcon, getCategoryLabel } from "../utils/categoryHelpers";
import { Report, ReportCategory } from "../types";
import { getReports } from "../lib/api/reports";

interface ReportsTickerProps {
  reports?: Report[];
  onReportClick?: (report: Report) => void;
}

type AnimState = "entering" | "visible" | "leaving" | "hidden";

const VISIBLE_MS = 4500;
const TRANSITION_MS = 420;
const RECENT_DAYS = 7;
const MAX_REPORTS = 20;
const POLL_MS = 15_000;

const PROMO = {
  label: "Reportes Reconquista",
  description:
    "Creá reportes en Reconquista y mantené informada a toda la comunidad.",
};

export default function ReportsTicker({
  reports: reportsProp,
  onReportClick,
}: ReportsTickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [reports, setReports] = useState<Report[]>(reportsProp || []);
  const [index, setIndex] = useState(0);
  const [animState, setAnimState] = useState<AnimState>("hidden");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-abastecerse de reportes cuando no viene de un padre
  const fetchReports = useRef(() => {
    getReports()
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch(() => {});
  });

  useEffect(() => {
    if (reportsProp) return; // viene del padre, no auto-fetch
    fetchReports.current();
    const interval = setInterval(fetchReports.current, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchReports.current();
    };
    const onUpdated = () => fetchReports.current();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("reports:updated", onUpdated);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("reports:updated", onUpdated);
    };
  }, [reportsProp]);

  const now = Date.now();
  const isRecent = (date: Date | string) => {
    const d = new Date(date).getTime();
    return now - d < RECENT_DAYS * 24 * 60 * 60 * 1000;
  };

  const recent = reports
    .filter((r) => isRecent(r.createdAt))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_REPORTS);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

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
      setAnimState("entering");
      const t = setTimeout(() => setAnimState("visible"), 30);
      return () => clearTimeout(t);
    }
    setAnimState("entering");
    const t1 = setTimeout(() => {
      setAnimState("visible");
      timerRef.current = setTimeout(advance, VISIBLE_MS);
    }, 30);
    return () => {
      clear();
      clearTimeout(t1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recent.length]);

  const handleClick = () => {
    if (recent.length === 0) {
      router.push("/app?view=reports");
      return;
    }
    const report = recent[index];
    if (onReportClick) {
      onReportClick(report);
    } else {
      router.push(`/app?view=reports&report=${report.id}`);
    }
  };

  // ── DESKTOP: subnav integrada al navbar (empuja el contenido) ──
  // Rota por los reportes (mismo índice que la tarjeta mobile)
  const current = recent.length > 0 ? recent[index] : undefined;
  const NavIcon = current ? getCategoryIcon(current.category as ReportCategory) : Megaphone;
  const navLabel = current ? getCategoryLabel(current.category as ReportCategory) : PROMO.label;
  const navDesc = current ? current.description : PROMO.description;

  // Fade para el ciclo (si no hay reportes, la promo queda siempre visible)
  const stripOpacity =
    recent.length === 0
      ? "opacity-100"
      : animState === "visible"
      ? "opacity-100"
      : "opacity-0";

  const navStrip = (
    <div className="hidden md:block w-full bg-emerald-600 text-white">
      <button
        onClick={handleClick}
        className={`w-full max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs transition-opacity duration-[420ms] ease-in-out ${stripOpacity}`}
      >
        <NavIcon className="w-4 h-4 shrink-0" />
        <span className="font-bold shrink-0 uppercase tracking-wide">{navLabel}</span>
        <span className="truncate flex-1">{navDesc}</span>
        <span className="shrink-0 font-semibold opacity-80">Ver más</span>
      </button>
    </div>
  );

  // ── MOBILE: tarjeta flotante (en el mapa sube para no tapar emergencia/mic) ──
  const tickerPos = pathname.startsWith("/app") ? "bottom-48" : "bottom-20";

  const translate =
    animState === "entering"
      ? "translate-x-full opacity-0"
      : animState === "visible"
      ? "translate-x-0 opacity-100"
      : animState === "leaving"
      ? "-translate-x-full opacity-0"
      : "translate-x-full opacity-0";

  let floatingCard: React.ReactNode = null;

  if (recent.length === 0) {
    floatingCard = (
      <div className={`md:hidden fixed ${tickerPos} left-0 right-0 z-[900] flex justify-center px-4`}>
        <button
          onClick={handleClick}
          className="w-full max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 text-white transition-all duration-[420ms] ease-in-out"
        >
          <span className="shrink-0 w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </span>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold uppercase tracking-wide leading-none mb-0.5">
              {PROMO.label}
            </p>
            <p className="text-sm font-medium truncate leading-snug">
              {PROMO.description}
            </p>
          </div>
          <span className="shrink-0 text-xs font-semibold opacity-80">
            Ver más
          </span>
        </button>
      </div>
    );
  } else {
    const report = recent[index];
    if (report) {
      const Icon = getCategoryIcon(report.category as ReportCategory);
      const label = getCategoryLabel(report.category as ReportCategory);
      const location =
        report.direccion && report.direccion !== "Sin especificar"
          ? report.direccion
          : report.barrio && report.barrio !== "Sin especificar"
          ? report.barrio
          : null;

      const handleTouch = (e: React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        handleClick();
      };

      floatingCard = (
        <div className={`md:hidden fixed ${tickerPos} left-0 right-0 z-[900] flex justify-center px-4`}>
          <button
            onClick={handleClick}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchEnd={handleTouch}
            className={`w-full max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl cursor-pointer bg-emerald-50/95 dark:bg-emerald-900/80 backdrop-blur-md border border-emerald-300/60 dark:border-emerald-700/60 transition-all duration-[420ms] ease-in-out ${translate}`}
            style={{ willChange: "transform, opacity" }}
          >
            {Icon && (
              <span className="shrink-0 w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                <Icon className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
              </span>
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide leading-none mb-0.5">
                {label}
              </p>
              <p className="text-sm font-medium text-emerald-950 dark:text-white truncate leading-snug">
                {report.description}
              </p>
              {location && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                  {location}
                </p>
              )}
            </div>
            <span className="shrink-0 text-[10px] text-emerald-300 dark:text-emerald-600 font-medium">
              {index + 1}/{recent.length}
            </span>
          </button>
        </div>
      );
    }
  }

  return (
    <>
      {navStrip}
      {floatingCard}
    </>
  );
}
