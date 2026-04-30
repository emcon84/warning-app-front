"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Phone frame ──────────────────────────────────────────────

function PhoneFrame({ children, glow }: { children: React.ReactNode; glow: string }) {
  return (
    <div className="relative shrink-0 mx-auto" style={{ width: 210, height: 430 }}>
      {/* Glow ambiental */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: glow, transition: "background 0.8s ease" }}
      />
      {/* Cuerpo del phone */}
      <div className="relative h-full rounded-[36px] border-[3px] border-gray-700 bg-gray-950 overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
        {/* Dynamic island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[48px] h-[14px] bg-black rounded-b-2xl z-20" />
        {/* Screen content */}
        <div className="absolute inset-0 overflow-hidden">
          {children}
        </div>
        {/* Reflejo superior sutil */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
}

// ─── Slides ────────────────────────────────────────────────────

type Slide = {
  id: string;
  badge: string;
  badgeCls: string;
  headline: string;
  headlineSuffix: string;
  accentCls: string;
  sub: string;
  cta: { label: string; href: string };
  glow: string;
  dotActiveCls: string;
  screenshot: string;
};

const SLIDES: Slide[] = [
  {
    id: "home",
    badge: "Super-app local",
    badgeCls: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    headline: "Todo Reconquista,",
    headlineSuffix: "en un solo lugar",
    accentCls: "text-blue-600 dark:text-blue-400",
    sub: "Oficios, comercios, medicos, farmacias de turno, ofertas y reportes. La app de tu ciudad.",
    cta: { label: "Abrir la app", href: "/home" },
    glow: "#3b82f6",
    dotActiveCls: "bg-blue-600 dark:bg-blue-400",
    screenshot: "/screenshots/screen-home.png",
  },
  {
    id: "oficios",
    badge: "Oficios y Profesionales",
    badgeCls: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    headline: "El profesional que necesitas,",
    headlineSuffix: "en tu ciudad",
    accentCls: "text-purple-600 dark:text-purple-400",
    sub: "Plomeros, electricistas, albaniles y mas. Perfil con calificaciones y contacto directo.",
    cta: { label: "Ver oficios", href: "/oficios" },
    glow: "#a855f7",
    dotActiveCls: "bg-purple-600 dark:bg-purple-400",
    screenshot: "/screenshots/screen-oficios.png",
  },
  {
    id: "comercios",
    badge: "Comercios locales",
    badgeCls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    headline: "Los negocios de Reconquista",
    headlineSuffix: "en tu bolsillo",
    accentCls: "text-amber-600 dark:text-amber-400",
    sub: "Encontra comercios locales, sus productos y ofertas. Contacto directo por WhatsApp.",
    cta: { label: "Ver comercios", href: "/comercios" },
    glow: "#f59e0b",
    dotActiveCls: "bg-amber-600 dark:bg-amber-400",
    screenshot: "/screenshots/screen-comercios.png",
  },
  {
    id: "ofertas",
    badge: "Ofertas de supermercados",
    badgeCls: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    headline: "Las mejores ofertas",
    headlineSuffix: "de Reconquista",
    accentCls: "text-yellow-600 dark:text-yellow-400",
    sub: "Ofertas y promociones de los supermercados de Reconquista en un solo lugar.",
    cta: { label: "Ver ofertas", href: "/ofertas" },
    glow: "#eab308",
    dotActiveCls: "bg-yellow-600 dark:bg-yellow-400",
    screenshot: "/screenshots/screen-ofertas.png",
  },
  {
    id: "medicos",
    badge: "Medicos IAPOS y PAMI",
    badgeCls: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    headline: "Tu medico de cabecera",
    headlineSuffix: "a un toque",
    accentCls: "text-cyan-600 dark:text-cyan-400",
    sub: "195 medicos en Reconquista con especialidad, obra social y ubicacion. Busca el tuyo.",
    cta: { label: "Ver medicos", href: "/medicos" },
    glow: "#06b6d4",
    dotActiveCls: "bg-cyan-600 dark:bg-cyan-400",
    screenshot: "/screenshots/screen-medicos.png",
  },
  {
    id: "farmacias",
    badge: "Farmacias de turno",
    badgeCls: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    headline: "Que farmacia esta",
    headlineSuffix: "de turno hoy",
    accentCls: "text-green-600 dark:text-green-400",
    sub: "Sabe en segundos que farmacia de Reconquista esta disponible. Con mapa y telefono.",
    cta: { label: "Ver farmacias", href: "/farmacias" },
    glow: "#22c55e",
    dotActiveCls: "bg-green-600 dark:bg-green-400",
    screenshot: "/screenshots/screen-farmacias.png",
  },
];

// ─── Animación ─────────────────────────────────────────────────

const textVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

const screenVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0, scale: 0.97 }),
};

// ─── Main ──────────────────────────────────────────────────────

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);

  const goTo = useCallback(
    (idx: number, direction?: number) => {
      setDir(direction ?? (idx > current ? 1 : -1));
      setCurrent(idx);
    },
    [current]
  );

  const next = useCallback(() => goTo((current + 1) % SLIDES.length, 1), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length, -1), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [next, paused]);

  const slide = SLIDES[current];

  return (
    <div
      className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 py-10 lg:py-24 px-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const d = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(d) > 50) d > 0 ? next() : prev();
      }}
    >
      {/* ── Texto ─────────────────────────────────────────────── */}
      <div className="flex-1 max-w-lg text-center lg:text-left">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={slide.id}
            custom={dir}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-4 lg:mb-5 ${slide.badgeCls}`}>
              {slide.badge}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-[1.1] mb-4 lg:mb-5 tracking-tight">
              {slide.headline}{" "}
              <span className={slide.accentCls}>{slide.headlineSuffix}</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base lg:text-lg leading-relaxed mb-6 lg:mb-8">
              {slide.sub}
            </p>
            <Link
              href={slide.cta.href}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-colors text-sm w-full sm:w-auto"
            >
              {slide.cta.label}
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Dots + flechas */}
        <div className="flex items-center gap-3 mt-7 lg:mt-10 justify-center lg:justify-start">
          <button
            onClick={prev}
            className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? `w-6 h-2 ${slide.dotActiveCls}`
                    : "w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Phone con screenshot real ──────────────────────────── */}
      {/* Mobile: 75% scale con margen negativo para colapsar espacio extra */}
      {/* Desktop: 100% */}
      <div className="shrink-0 scale-[0.75] lg:scale-100 origin-top -mb-[108px] lg:mb-0">
        <PhoneFrame glow={slide.glow}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.img
              key={slide.screenshot}
              custom={dir}
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              src={slide.screenshot}
              alt={slide.badge}
              className="absolute inset-0 w-full h-full object-cover object-top"
              draggable={false}
            />
          </AnimatePresence>
        </PhoneFrame>
      </div>
    </div>
  );
}
