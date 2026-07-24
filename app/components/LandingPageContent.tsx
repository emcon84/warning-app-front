"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Stethoscope,
  Pill,
  Wrench,
  Store,
  ShoppingCart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageCircle,
  QrCode,
  Package,
  Check,
  X as XIcon,
  MapPin,
  Phone,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import LandingThemeToggle from "./LandingThemeToggle";

// ─── Types ──────────────────────────────────────────────────────

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bg: string;
  sectionId: string;
}

interface FAQItem {
  q: string;
  a: string;
}

// ─── Data ───────────────────────────────────────────────────────

const FEATURES: Feature[] = [
  {
    icon: AlertTriangle,
    title: "Reportes ciudadanos",
    description:
      "Reportá baches, inundaciones, alumbrado roto y situaciones urbanas. Quedan geolocalizados y visibles para todos los vecinos.",
    color: "text-orange-500 dark:text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    sectionId: "feature-reportes",
  },
  {
    icon: Pill,
    title: "Farmacias de turno",
    description:
      "Sabé cuál farmacia está de turno hoy en Reconquista. Actualizado diariamente con dirección y teléfono.",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    sectionId: "feature-farmacias",
  },
  {
    icon: Stethoscope,
    title: "Médicos IAPOS y PAMI",
    description:
      "Directorio completo de médicos en Reconquista con especialidad, obra social y ubicación en el mapa.",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    sectionId: "feature-medicos",
  },
  {
    icon: Store,
    title: "Comercios locales",
    description:
      "El directorio de negocios de Reconquista. Encontrá lo que necesitás y contactá directamente por WhatsApp.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    sectionId: "feature-comercios",
  },
  {
    icon: Wrench,
    title: "Oficios y Profesionales",
    description:
      "Plomeros, electricistas, albañiles, contadores, abogados y más. Contacto directo por chat en tiempo real.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    sectionId: "feature-oficios",
  },
  {
    title: "Médicos IAPOS y PAMI",
    description:
      "Encontrá médicos, especialistas y centros de salud con información de obras sociales y ubicación en el mapa.",
    icon: Stethoscope,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/5 border-rose-500/10",
    sectionId: "feature-medicos",
  },
];

const FEATURES_SCROLL = [
  {
    id: "feature-reportes",
    badge: "Reportes Ciudadanos",
    badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    title: "Reportá problemas en tu ciudad",
    description: "Marcá en el mapa baches, inundaciones, alumbrado roto o pastizales. Cada reporte queda geolocalizado y visible para toda la comunidad.",
    cta: "Hacer un reporte",
    href: "/app",
    ctaColor: "bg-blue-600 hover:bg-blue-500 text-white",
    screenshot: "/screenshots/reportes-mobile.png",
  },
  {
    id: "feature-farmacias",
    badge: "Farmacias de Turno",
    badgeColor: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    title: "Farmacias de turno, siempre actualizadas",
    description: "Sabé qué farmacia está abierta hoy con dirección, teléfono y mapa. Datos actualizados diariamente.",
    cta: "Ver farmacias",
    href: "/app?view=farmacias",
    ctaColor: "bg-green-600 hover:bg-green-500 text-white",
    screenshot: "/screenshots/farmacias-mobile.png",
  },
  {
    id: "feature-medicos",
    badge: "Médicos IAPOS y PAMI",
    badgeColor: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    title: "Encontrá médicos por obra social",
    description: "Buscá médicos IAPOS, PAMI y otras obras sociales en Reconquista. Filtro por especialidad y ubicación.",
    cta: "Buscar médicos",
    href: "/medicos",
    ctaColor: "bg-cyan-600 hover:bg-cyan-500 text-white",
    screenshot: "/screenshots/medicos-mobile.png",
  },
  {
    id: "feature-comercios",
    badge: "Comercios Locales",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    title: "Vidriera digital de tu ciudad",
    description: "Descubrí comercios de Reconquista con catálogo, horarios y contacto directo por WhatsApp.",
    cta: "Explorar comercios",
    href: "/comercios",
    ctaColor: "bg-amber-600 hover:bg-amber-500 text-white",
    screenshot: "/screenshots/comercios-mobile.png",
  },
  {
    id: "feature-oficios",
    badge: "Oficios y Profesionales",
    badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    title: "Plomeros, electricistas y más",
    description: "Encontrá profesionales de confianza en Reconquista. Contacto directo por chat en tiempo real.",
    cta: "Buscar profesionales",
    href: "/oficios",
    ctaColor: "bg-purple-600 hover:bg-purple-500 text-white",
    screenshot: "/screenshots/oficios-mobile.png",
  },
  {
    id: "feature-ofertas",
    badge: "Ofertas de Supermercados",
    badgeColor: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    title: "Las mejores ofertas locales",
    description: "Promociones de supermercados actualizadas por la comunidad. Precios y productos al instante.",
    cta: "Ver ofertas",
    href: "/ofertas",
    ctaColor: "bg-yellow-600 hover:bg-yellow-500 text-white",
    screenshot: "/screenshots/medicos-mobile.png",
  },
];

const FAQ: FAQItem[] = [
  {
    q: "¿Dónde encontrar plomeros en Reconquista?",
    a: "En la sección Oficios encontrás plomeros, electricistas, albañiles y más profesionales con perfil, zona y contacto directo por chat.",
  },
  {
    q: "¿Cuál farmacia está de turno hoy en Reconquista?",
    a: "En la sección Farmacias ves la farmacia de turno de hoy en Reconquista con dirección y teléfono. Se actualiza diariamente.",
  },
  {
    q: "¿Cómo reportar un problema en la vía pública?",
    a: "Abrí la app, tocá el mapa en el punto del problema, elegí el tipo (bache, inundación, alumbrado…) y el reporte queda visible para vecinos y el municipio.",
  },
  {
    q: "¿Cómo encontrar médicos IAPOS en Reconquista?",
    a: "En la sección Médicos podés filtrar por IAPOS, PAMI u otras obras sociales. Encontrás especialidad, dirección y ubicación en el mapa.",
  },
  {
    q: "¿Cómo registro mi comercio en la app?",
    a: "En la sección Comercios tocás 'Registrar mi comercio', completás los datos en unos pasos y tu vidriera digital queda visible para toda la ciudad.",
  },
];

// ─── Animation presets ────────────────────────────────────────

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

// ─── Sub-components ────────────────────────────────────────────

function LaptopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative shrink-0 mx-auto" style={{ width: 420, height: 270 }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none bg-blue-500" />
      {/* Lid */}
      <div className="relative w-full h-[236px] rounded-t-xl border-[3px] border-b-0 border-gray-700 bg-gray-950 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-600 z-20" />
        <div className="absolute inset-0 overflow-hidden">{children}</div>
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />
      </div>
      {/* Base/keyboard */}
      <div className="relative w-full h-[34px] bg-gray-800 rounded-b-lg border-[3px] border-t-0 border-gray-700 shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-600 rounded-full" />
      </div>
    </div>
  );
}

function PhoneFrame({
  children,
  glow,
}: {
  children: React.ReactNode;
  glow: string;
}) {
  return (
    <div className="relative shrink-0 mx-auto" style={{ width: 210, height: 430 }}>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: glow, transition: "background 0.8s ease" }}
      />
      <div className="relative h-full rounded-[36px] border-[3px] border-gray-700 bg-gray-950 overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[48px] h-[14px] bg-black rounded-b-2xl z-20" />
        <div className="absolute inset-0 overflow-hidden">{children}</div>
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
}

function PhoneMockup({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-[260px] sm:w-[280px] mx-auto">
      <div className="absolute inset-0 bg-blue-500/5 rounded-[3rem] blur-3xl" />
      <div className="relative rounded-[2.5rem] border-[4px] border-gray-800 dark:border-gray-700 bg-gray-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-gray-800 rounded-b-xl z-20" />
        <div className="w-full aspect-[9/19] bg-black overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.img
              key={src}
              src={src}
              alt={alt}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full h-full object-cover object-top"
            />
          </AnimatePresence>
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-gray-600 rounded-full z-20" />
      </div>
    </div>
  );
}

function ScrollIndicator() {
  return (
    <motion.div
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        Scroll
      </span>
      <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
    </motion.div>
  );
}



// ─── Main Component ────────────────────────────────────────────

export default function LandingPageContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const [activeFeature, setActiveFeature] = useState(0);
  const featuresRef = useRef<HTMLElement>(null);

  // Mobile: sticky phone + horizontal text scroll
  const [mobileActiveIdx, setMobileActiveIdx] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Autoplay mobile slides
  useEffect(() => {
    const timer = setInterval(() => {
      if (!mobileScrollRef.current) return;
      const currentIdx = Math.round(mobileScrollRef.current.scrollLeft / window.innerWidth);
      const nextIdx = (currentIdx + 1) % FEATURES_SCROLL.length;
      mobileScrollRef.current.scrollTo({ left: nextIdx * window.innerWidth, behavior: "smooth" });
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  const { scrollYProgress } = useScroll({
    target: featuresRef,
    offset: ["start end", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const idx = Math.min(
      Math.floor(progress * FEATURES_SCROLL.length),
      FEATURES_SCROLL.length - 1,
    );
    setActiveFeature(idx);
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* ═══════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border-b border-gray-200/60 dark:border-gray-800/60 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="Logo" className="w-8 h-8 rounded-xl" />
            <span className="font-black text-gray-900 dark:text-white text-sm hidden sm:block">
              Reportes Reconquista
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "Características", id: "features" },
              { label: "Para comercios", id: "comercios-cta" },
              { label: "FAQ", id: "faq" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LandingThemeToggle />
            <Link
              href="/para-comercios"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              Sos comerciante?
            </Link>
            <Link
              href="/comercio/nuevo"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-bold rounded-xl transition-colors"
            >
              Registrar comercio
            </Link>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE MENU
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-white dark:bg-gray-950 md:hidden"
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-800">
              <span className="font-black text-sm">Menú</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-2">
              {[
                { label: "Características", id: "features" },
                { label: "Para comercios", id: "comercios-cta" },
                { label: "Preguntas frecuentes", id: "faq" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <hr className="my-2 border-gray-200 dark:border-gray-800" />
              <Link
                href="/para-comercios"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
              >
                <Store className="w-4 h-4" />
                Sos comerciante?
              </Link>
              <Link
                href="/comercio/nuevo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl text-sm transition-colors mt-2"
              >
                Registrar comercio
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.05)_0%,_transparent_60%)]" />
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, -60, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-3xl will-change-transform"
          />
          <motion.div
            animate={{ x: [0, -70, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 -right-40 w-[400px] h-[400px] rounded-full bg-amber-500/[0.06] blur-3xl will-change-transform"
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-purple-500/[0.05] blur-3xl will-change-transform"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full px-4 py-24 lg:py-0">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text */}
            <div className="flex-1 max-w-xl text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: easeOut, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-gray-900 dark:text-white"
              >
                Reconquista en{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  un solo lugar
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: easeOut, delay: 0.25 }}
                className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed mt-5 max-w-lg mx-auto lg:mx-0"
              >
                Oficios, comercios, médicos, farmacias de turno y
                reportes ciudadanos. Todo lo que necesitás, en una sola app
                gratuita.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: easeOut, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 mt-8 justify-center lg:justify-start"
              >
                <Link
                  href="/home"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40"
                >
                  Comenzá ahora
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/comercio/nuevo"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold rounded-2xl transition-colors text-sm"
                >
                  Registrar mi comercio
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: easeOut, delay: 0.55 }}
                className="flex flex-wrap items-center gap-6 mt-10 justify-center lg:justify-start"
              >
                {[
                  { value: "6+", label: "Servicios" },
                  { value: "100%", label: "Gratuito" },
                  { value: "Toda", label: "la ciudad" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {stat.value}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Mockups desktop */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: easeOut, delay: 0.3 }}
              className="shrink-0 hidden lg:flex items-end gap-2"
            >
              {/* Laptop */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="mb-4"
              >
                <LaptopFrame>
                  <img
                    src="/screenshots/home-desktop.png"
                    alt="Home - Reportes Reconquista Desktop"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                </LaptopFrame>
              </motion.div>

              {/* Phone */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <PhoneFrame glow="#3b82f6">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/screenshots/home-mobile.png"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  >
                    <source src="/videos/home-scroll.webm" type="video/webm" />
                    <source src="/videos/home-scroll.mp4" type="video/mp4" />
                  </video>
                </PhoneFrame>
              </motion.div>
            </motion.div>

            {/* Phone mockup mobile */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut, delay: 0.5 }}
              className="shrink-0 scale-[0.7] origin-top -mb-[120px] lg:hidden"
            >
              <PhoneFrame glow="#3b82f6">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/screenshots/home-mobile.png"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                >
                  <source src="/videos/home-scroll.webm" type="video/webm" />
                  <source src="/videos/home-scroll.mp4" type="video/mp4" />
                </video>
              </PhoneFrame>
            </motion.div>
          </div>
        </div>

        <ScrollIndicator />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES OVERVIEW
          ═══════════════════════════════════════════════════════════ */}
      <motion.section
        id="features"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="border-t border-gray-200/60 dark:border-gray-800/60 bg-gray-50 dark:bg-gray-900/20"
      >
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 mb-4"
            >
              Todo en un solo lugar
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: easeOut, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white"
            >
              La app que Reconquista necesitaba
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: easeOut, delay: 0.2 }}
              className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl mx-auto text-sm"
            >
              Siete herramientas esenciales para el día a día de los vecinos de
              Reconquista, Santa Fe.
            </motion.p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={cardVariants}>
                <button
                  onClick={() => scrollTo(f.sectionId)}
                  className={`group relative block w-full text-left p-6 rounded-2xl border ${f.bg} bg-white dark:bg-transparent hover:scale-[1.03] transition-all duration-300 hover:shadow-lg cursor-pointer`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.bg}`}
                  >
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">
                    {f.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
                    {f.description}
                  </p>
                  <ChevronRight
                    className={`w-4 h-4 ${f.color} absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURE DETAIL SECTIONS — Visual Tour (Sticky Phone)
          ═══════════════════════════════════════════════════════════ */}
      <section
        ref={featuresRef}
        className="relative border-t border-gray-200/60 dark:border-gray-800/60 pt-16 lg:pt-24 pb-32 lg:pb-48"
      >
        {/* Dynamic background that shifts per feature */}
        <motion.div
          className="absolute inset-0 transition-colors duration-700"
          animate={{
            background: [
              "radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.04) 0%, transparent 60%)",
              "radial-gradient(ellipse at 70% 50%, rgba(34,197,94,0.04) 0%, transparent 60%)",
              "radial-gradient(ellipse at 30% 50%, rgba(6,182,212,0.04) 0%, transparent 60%)",
              "radial-gradient(ellipse at 70% 50%, rgba(245,158,11,0.04) 0%, transparent 60%)",
              "radial-gradient(ellipse at 30% 50%, rgba(168,85,247,0.04) 0%, transparent 60%)",
              "radial-gradient(ellipse at 70% 50%, rgba(234,179,8,0.04) 0%, transparent 60%)",
              "radial-gradient(ellipse at 30% 50%, rgba(244,63,94,0.04) 0%, transparent 60%)",
            ][activeFeature] || "radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.04) 0%, transparent 60%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4">
          {/* Desktop: two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16">
            {/* Left: text sections that scroll — hidden on mobile */}
            <div className="hidden lg:block space-y-0">
              {FEATURES_SCROLL.map((feature, i) => (
                <section
                  key={feature.id}
                  id={feature.id}
                  className="min-h-[60vh] flex items-center py-12 lg:py-16"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-80px" }}
                    transition={{ duration: 0.6, ease: easeOut }}
                    className="max-w-md"
                  >
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-5 ${feature.badgeColor}`}>
                      {feature.badge}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <Link
                      href={feature.href}
                      className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-colors ${feature.ctaColor}`}
                    >
                      {feature.cta}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </section>
              ))}
            </div>

            {/* Right: sticky phone mockup - hidden on mobile */}
            <div className="hidden lg:block relative">
              <div className="sticky top-32 flex justify-center">
                <PhoneMockup
                  key={activeFeature}
                  src={FEATURES_SCROLL[activeFeature].screenshot}
                  alt={FEATURES_SCROLL[activeFeature].badge}
                />
              </div>
            </div>
          </div>

          {/* Mobile: sticky phone + horizontal text scroll */}
          <div className="lg:hidden">
            {/* Phone — sin sticky, scrollea con el resto */}
            <div className="overflow-hidden flex-shrink-0" style={{ height: 460 }}>
              <div className="flex justify-center scale-[0.8] origin-top">
                <PhoneMockup
                  src={FEATURES_SCROLL[mobileActiveIdx].screenshot}
                  alt={FEATURES_SCROLL[mobileActiveIdx].badge}
                />
              </div>
            </div>

            {/* Texto en scroll horizontal con snap */}
            <div
              ref={mobileScrollRef}
              onScroll={() => {
                if (!mobileScrollRef.current) return;
                const idx = Math.round(mobileScrollRef.current.scrollLeft / window.innerWidth);
                setMobileActiveIdx(Math.min(idx, FEATURES_SCROLL.length - 1));
              }}
              className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
            >
              <div className="flex" style={{ width: `${FEATURES_SCROLL.length * 100}vw` }}>
                {FEATURES_SCROLL.map((feature) => (
                  <div
                    key={feature.id}
                    className="w-screen flex-shrink-0 snap-start flex flex-col items-center text-center px-6 pt-8 pb-4"
                  >
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-4 ${feature.badgeColor}`}>
                      {feature.badge}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
                      {feature.description}
                    </p>
                    <Link
                      href={feature.href}
                      className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-colors ${feature.ctaColor}`}
                    >
                      {feature.cta}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots + flechas */}
            <div className="flex items-center justify-center gap-2 pb-4 pt-2">
              <button
                onClick={() => {
                  if (!mobileScrollRef.current || mobileActiveIdx === 0) return;
                  mobileScrollRef.current.scrollTo({ left: (mobileActiveIdx - 1) * window.innerWidth, behavior: "smooth" });
                }}
                disabled={mobileActiveIdx === 0}
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 mx-2">
                {FEATURES_SCROLL.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!mobileScrollRef.current) return;
                      mobileScrollRef.current.scrollTo({ left: i * window.innerWidth, behavior: "smooth" });
                    }}
                    className={`rounded-full transition-all duration-300 ${
                      i === mobileActiveIdx
                        ? "w-6 h-2 bg-blue-600 dark:bg-blue-400"
                        : "w-2 h-2 bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  if (!mobileScrollRef.current || mobileActiveIdx === FEATURES_SCROLL.length - 1) return;
                  mobileScrollRef.current.scrollTo({ left: (mobileActiveIdx + 1) * window.innerWidth, behavior: "smooth" });
                }}
                disabled={mobileActiveIdx === FEATURES_SCROLL.length - 1}
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          COMMERCE CTA
          ═══════════════════════════════════════════════════════════ */}
      <motion.section
        id="comercios-cta"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="border-t border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-br from-amber-50 dark:from-amber-950/30 to-white dark:to-gray-950"
      >
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text */}
            <div className="flex-1 max-w-lg">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: easeOut }}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-5"
              >
                Para comerciantes
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: easeOut, delay: 0.1 }}
                className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-5"
              >
                Tu negocio visible para{" "}
                <span className="text-amber-500 dark:text-amber-400">
                  toda la ciudad
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: easeOut, delay: 0.2 }}
                className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6 text-sm"
              >
                Registrá tu comercio en minutos y tené tu vidriera digital
                gratuita. Foto, descripción, catálogo de productos, horario y
                contacto directo por WhatsApp.
              </motion.p>
              <motion.ul
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: easeOut, delay: 0.3 }}
                className="space-y-2.5 mb-8"
              >
                {[
                  "Perfil con foto, descripción y datos de contacto",
                  "Catálogo de productos con precio y foto",
                  "Aparecés en el directorio de comercios de Reconquista",
                  "Kit de QR imprimible para tu vidriera",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </motion.ul>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: easeOut, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link
                  href="/comercio/nuevo"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-2xl transition-colors text-sm"
                >
                  Registrar mi comercio gratis
                </Link>
                <Link
                  href="/para-comercios"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:border-amber-500 font-semibold rounded-2xl transition-colors text-sm"
                >
                  Ver planes y precios
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Phone mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: easeOut, delay: 0.2 }}
              className="relative shrink-0"
            >
              <div className="absolute inset-0 bg-amber-500/10 rounded-3xl blur-3xl" />
              <div className="relative w-72 bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
                <div className="h-24 bg-gradient-to-br from-amber-900/60 to-gray-900 flex items-end p-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center">
                    <Store className="w-7 h-7 text-amber-400" />
                  </div>
                </div>
                <div className="p-4 pb-2">
                  <p className="font-black text-white text-sm">
                    Ferretería El Tornillo
                  </p>
                  <p className="text-amber-400 text-xs mt-0.5">
                    Ferretería · Centro
                  </p>
                  <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                    Todo en herramientas, materiales y accesorios para tu hogar
                    y obra.
                  </p>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wide mb-2">
                    Catálogo
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "Taladro 600W", price: "$45.000" },
                      { name: "Cinta métrica 5m", price: "$3.200" },
                      { name: "Pintura látex 4L", price: "$12.500" },
                    ].map((p, i) => (
                      <div
                        key={i}
                        className="bg-gray-800 rounded-xl p-2 text-center"
                      >
                        <div className="w-8 h-8 bg-gray-700 rounded-lg mx-auto mb-1 flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-500" />
                        </div>
                        <p className="text-white text-[8px] font-semibold leading-tight">
                          {p.name}
                        </p>
                        <p className="text-amber-400 text-[8px] mt-0.5">
                          {p.price}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="w-full mt-3 py-2 bg-green-500/20 text-green-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Contactar por WhatsApp
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-gray-800 px-2 py-1.5 rounded-lg">
                      <QrCode className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400 text-[8px]">
                        Kit vidriera
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 text-[8px] font-semibold">
                        4.8
                      </span>
                      <span className="text-gray-600 text-[8px]">(24)</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════
          COMPARISON
          ═══════════════════════════════════════════════════════════ */}
      <motion.section
        id="comparison"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 mb-5"
            >
              Para dueños de comercio
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: easeOut, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight"
            >
              ¿Por qué no alcanza con Instagram?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: easeOut, delay: 0.2 }}
              className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto text-sm leading-relaxed"
            >
              Las redes sociales son para que te vean. Reportes Reconquista es
              para que te encuentren cuando alguien necesita exactamente lo que
              vos vendés.
            </motion.p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10"
          >
            <motion.div
              variants={cardVariants}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900/50 hover:shadow-lg transition-shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
                Solo con Instagram
              </p>
              <ul className="space-y-4">
                {[
                  'El algoritmo decide quién te ve, y a veces no te ve nadie',
                  'Nadie busca "ferretería en Reconquista" en Instagram',
                  "Las publicaciones desaparecen del feed en horas",
                  "Para contactarte: DM, esperar, dar el número, ahí recién WhatsApp",
                  "Tu catálogo son fotos desordenadas mezcladas con todo lo demás",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <div className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <XIcon className="w-3 h-3 text-red-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={cardVariants}
              className="rounded-2xl border border-blue-500/25 p-6 bg-blue-500/5 hover:shadow-lg transition-shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-6">
                Con Reportes Reconquista
              </p>
              <ul className="space-y-4">
                {[
                  "Aparecés cuando alguien busca lo que vos vendés, sin depender de ningún algoritmo",
                  "Tu perfil está visible 24/7 en el directorio local de Reconquista",
                  "Botón de WhatsApp directo desde tu perfil, un toque y ya están hablando con vos",
                  "Catálogo organizado con fotos y precios, siempre actualizado y siempre visible",
                  "QR imprimible para la vidriera: del local a tu perfil digital en segundos",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.3 }}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-50 dark:from-blue-950/30 to-amber-50 dark:to-amber-950/20 p-8 sm:p-12 text-center"
          >
            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-snug">
              En Instagram la gente{" "}
              <span className="text-purple-600 dark:text-purple-400">
                pasa el tiempo
              </span>
              .<br />
              En Reportes Reconquista la gente{" "}
              <span className="text-blue-600 dark:text-blue-400">
                busca lo que necesita
              </span>
              .
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 max-w-lg mx-auto leading-relaxed">
              Quien llega a tu perfil en la app ya está buscando un comercio
              como el tuyo. Esa intención de compra no existe en ninguna red
              social.
            </p>
            <Link
              href="/comercio/nuevo"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm transition-colors"
            >
              Registrar mi comercio gratis
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════════════════════ */}
      <motion.section
        id="faq"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="border-t border-gray-200/60 dark:border-gray-800/60 bg-gray-50 dark:bg-gray-900/20"
      >
        <div className="max-w-3xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex items-center justify-between w-full p-5 text-left cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-gray-900 dark:text-white pr-4">
                      {item.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.2, ease: easeOut }}
                      className="shrink-0"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key={`faq-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: easeOut }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="seo-content"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="border-t border-gray-200/60 dark:border-gray-800/60"
      >
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
            ¿Qué es Reportes Reconquista?
          </h2>
          <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            <p>
              Reportes Reconquista es la plataforma ciudadana de Reconquista,
              Santa Fe, Argentina. Permite a los vecinos reportar problemas en
              la vía pública como baches, inundaciones, alumbrado roto y
              pastizales, geolocalizados en el mapa para que toda la comunidad y
              el municipio puedan verlos en tiempo real.
            </p>
            <p>
              Además del módulo de reportes, la app incluye un directorio
              completo de médicos IAPOS, PAMI y otras obras sociales en
              Reconquista; información actualizada diariamente sobre farmacias
              de turno con dirección y teléfono; un directorio de profesionales
              y oficios como plomeros, electricistas, gasistas, pintores y
              albañiles con contacto directo por chat; y un directorio de
              comercios locales con vidriera digital, catálogo de productos y
              contacto directo por WhatsApp.
            </p>
            <p>
              Reportes Reconquista también agrega las ofertas de los
              supermercados de Reconquista actualizadas por la comunidad,
              funciona como PWA instalable en Android e iOS sin necesidad de
              descargar nada, y envía notificaciones push para mantenerte al
              tanto de lo que pasa en tu ciudad. Completamente gratuita para los
              vecinos y para los comerciantes que quieran registrar su negocio.
            </p>
          </div>
        </div>
      </motion.section>

      <footer id="footer" className="border-t border-gray-200/60 dark:border-gray-800/60 bg-gray-50 dark:bg-gray-900/20">
        <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img
              src="/icon.svg"
              alt="Logo"
              className="w-7 h-7 rounded-xl"
            />
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
              Reportes Reconquista
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
            Hecho con amor para los vecinos de Reconquista, Santa Fe, Argentina.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: "App", href: "/home" },
              { label: "Oficios", href: "/home" },
              { label: "Comercios", href: "/home" },
              { label: "Farmacias", href: "/home" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
