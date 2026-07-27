"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { resolvePhotoUrl } from "@/lib/utils/photo";
import {
  PRO_GRADIENTS, COMERCIO_BG_GRADIENTS, slideVariants,
} from "@/lib/constants/homeConstants";

interface HeroSlideData {
  id: string;
  slideType: "professional" | "comercio" | "promo";
  title: string;
  subtitle: string | null;
  description: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  imageUrl: string | null;
  imagePosition: string;
}

interface HeroSliderProps {
  slides: HeroSlideData[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const { isDark } = useTheme();
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const swipeX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDir(1);
      setSlide((p) => (p + 1) % slides.length);
    }, 6000);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length]);

  const paginate = (newDir: number) => {
    setDir(newDir);
    setSlide((p) => (p + newDir + slides.length) % slides.length);
    resetTimer();
  };

  if (slides.length === 0) {
    return (
      <section className="relative w-full min-h-[280px] md:min-h-[400px] bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Descubrí comercios y profesionales</h2>
          <p className="text-white/50 text-sm max-w-xs mx-auto">
            Explorá los comercios y profesionales de Reconquista. Tu ciudad en un solo lugar.
          </p>
        </div>
      </section>
    );
  }

  const current = slides[slide];
  const hasBg = !!current.imageUrl;

  let bgGradient: string;
  if (current.slideType === "promo") {
    bgGradient = "from-gray-950/90 via-gray-950/70 to-transparent";
  } else if (current.slideType === "comercio") {
    bgGradient = COMERCIO_BG_GRADIENTS[slide % COMERCIO_BG_GRADIENTS.length];
  } else {
    bgGradient = PRO_GRADIENTS[slide % PRO_GRADIENTS.length];
  }

  const ctaLabel =
    current.ctaText ||
    (current.slideType === "professional"
      ? "Ver perfil"
      : current.slideType === "comercio"
        ? "Ver comercio"
        : "Ver más");

  const ctaUrl = current.ctaUrl || null;

  return (
    <section
      className="relative w-full min-h-[280px] md:min-h-[400px] overflow-hidden touch-pan-y pt-24"
      onPointerDown={(e) => { swipeX.current = e.clientX; }}
      onPointerUp={(e) => {
        const d = swipeX.current - e.clientX;
        if (d > 50) paginate(1);
        else if (d < -50) paginate(-1);
      }}
    >
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={current.id}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {ctaUrl ? (
            <Link href={ctaUrl} className="block h-full">
              <div
                className={`h-full relative overflow-hidden${
                  hasBg ? " bg-gray-950" : ` bg-gradient-to-br ${bgGradient}`
                }`}
              >
                {hasBg && (
                  <>
                    <Image
                      src={resolvePhotoUrl(current.imageUrl)}
                      alt=""
                      fill
                      className="object-cover"
                      style={{ objectPosition: current.imagePosition || "center" }}
                      unoptimized
                    />
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/70 to-gray-950/50" />
                    </>
                  )}

                  {!hasBg && current.slideType !== "promo" && (
                    <>
                      <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
                      <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
                    </>
                  )}

                <div className="relative z-10 h-full max-w-5xl mx-auto px-4 md:px-8">
                <div className="h-full flex flex-col justify-center gap-1.5 w-full md:max-w-[55%] pt-12 md:pt-0">
                      {current.slideType === "promo" && (
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">PROMO</span>
                      )}
                    <h2 className="text-white font-bold text-xl md:text-2xl leading-tight">{current.title}</h2>
                    {current.subtitle && (
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-2 md:line-clamp-3">{current.subtitle}</p>
                    )}
                    {current.description && (
                      <p className="text-white/50 text-sm leading-relaxed line-clamp-1 md:line-clamp-2 hidden sm:block">{current.description}</p>
                    )}
                    <span className="inline-flex items-center gap-1.5 font-bold text-xs px-4 py-2.5 rounded-full w-fit mt-1 bg-white text-gray-900 transition-opacity">
                      {ctaLabel} <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div
              className={`h-full relative overflow-hidden${
                hasBg ? " bg-gray-950" : ` bg-gradient-to-br ${bgGradient}`
              }`}
            >
              {hasBg && (
                <>
                  <Image
                    src={resolvePhotoUrl(current.imageUrl)}
                    alt=""
                    fill
                    className={`object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    style={{ objectPosition: current.imagePosition || "center" }}
                    onLoad={() => setImageLoaded(true)}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/70 to-gray-950/50" />
                </>
              )}

              {!hasBg && current.slideType !== "promo" && (
                <>
                  <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
                  <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
                </>
              )}

              <div className="relative z-10 h-full max-w-5xl mx-auto px-4 md:px-8">
                <div className="h-full flex flex-col justify-center gap-1.5 w-full md:max-w-[55%] pt-12 md:pt-0">
                  {current.slideType === "promo" && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">PROMO</span>
                  )}
                  <h2 className="text-white font-bold text-xl md:text-2xl leading-tight">{current.title}</h2>
                  {current.subtitle && (
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-2 md:line-clamp-3">{current.subtitle}</p>
                  )}
                  {current.description && (
                    <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{current.description}</p>
                  )}
                  {ctaUrl ? (
                    <Link
                      href={ctaUrl}
                      className="inline-flex items-center gap-1.5 font-bold text-xs px-4 py-2.5 rounded-full w-fit mt-1 bg-white text-gray-900 hover:opacity-90 transition-opacity"
                    >
                      {ctaLabel} <ChevronRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-bold text-xs px-4 py-2.5 rounded-full w-fit mt-1 bg-white/10 text-white/60">
                      {ctaLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDir(i > slide ? 1 : -1); setSlide(i); resetTimer(); }}
            className={`rounded-full transition-all duration-300 ${
              i === slide ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      <button
        onClick={() => paginate(-1)}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 items-center justify-center text-white backdrop-blur-sm transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => paginate(1)}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 items-center justify-center text-white backdrop-blur-sm transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* bottom fade */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t to-transparent pointer-events-none z-10 ${
          isDark ? "from-gray-950" : "from-gray-50"
        }`}
      />
    </section>
  );
}
