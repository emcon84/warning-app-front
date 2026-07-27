"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { resolvePhotoUrl } from "@/lib/utils/photo";
import {
  PRO_GRADIENTS, COMERCIO_BG_GRADIENTS,
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
  const [transitioning, setTransitioning] = useState(false);
  const swipeX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setTransitioning(true);
      setSlide(p => (p + 1) % slides.length);
      setTimeout(() => setTransitioning(false), 500);
    }, 6000);
  };

  const goTo = (next: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setSlide(next);
    setTimeout(() => setTransitioning(false), 500);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length]);

  // Preload next image
  useEffect(() => {
    if (slides.length <= 1) return;
    const nextIdx = (slide + 1) % slides.length;
    const nextUrl = slides[nextIdx]?.imageUrl;
    if (nextUrl) {
      const img = new window.Image();
      img.src = resolvePhotoUrl(nextUrl);
    }
  }, [slide, slides]);

  const paginate = (dir: number) => {
    const next = (slide + dir + slides.length) % slides.length;
    goTo(next);
    startTimer();
  };

  if (slides.length === 0) {
    return (
      <section className="relative w-full min-h-[280px] md:min-h-[400px] bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="relative z-10 text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Descubrí comercios y profesionales</h2>
          <p className="text-white/50 text-sm max-w-xs mx-auto">Explorá los comercios y profesionales de Reconquista.</p>
        </div>
      </section>
    );
  }

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
      {/* Render all slides, only one visible */}
      {slides.map((s, i) => {
        const isActive = i === slide;
        const hasBg = !!s.imageUrl;

        let bgGradient: string;
        if (s.slideType === "promo") {
          bgGradient = "from-gray-950/90 via-gray-950/70 to-transparent";
        } else if (s.slideType === "comercio") {
          bgGradient = COMERCIO_BG_GRADIENTS[i % COMERCIO_BG_GRADIENTS.length];
        } else {
          bgGradient = PRO_GRADIENTS[i % PRO_GRADIENTS.length];
        }

        const ctaLabel = s.ctaText || (s.slideType === "professional" ? "Ver perfil" : s.slideType === "comercio" ? "Ver comercio" : "Ver más");

        return (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
          >
            <div
              className={`h-full relative overflow-hidden${hasBg ? " bg-gray-950" : ` bg-gradient-to-br ${bgGradient}`}`}
            >
              {hasBg && (
                <>
                  <Image src={resolvePhotoUrl(s.imageUrl)} alt="" fill className="object-cover" style={{ objectPosition: s.imagePosition || "center" }} unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/70 to-gray-950/50" />
                </>
              )}
              {!hasBg && s.slideType !== "promo" && (
                <>
                  <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/5" />
                  <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
                </>
              )}

              <div className="relative z-10 h-full max-w-5xl mx-auto px-4 md:px-8">
                <div className="h-full flex flex-col justify-center gap-1.5 w-full md:max-w-[55%] pt-12 md:pt-0">
                  {s.slideType === "promo" && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">PROMO</span>
                  )}
                  <h2 className="text-white font-bold text-xl md:text-2xl leading-tight">{s.title}</h2>
                  {s.subtitle && <p className="text-white/70 text-sm leading-relaxed line-clamp-2 md:line-clamp-3">{s.subtitle}</p>}
                  {s.description && <p className="text-white/50 text-sm leading-relaxed line-clamp-1 md:line-clamp-2 hidden sm:block">{s.description}</p>}
                  {s.ctaUrl ? (
                    <Link href={s.ctaUrl} className="inline-flex items-center gap-1.5 font-bold text-xs px-4 py-2.5 rounded-full w-fit mt-1 bg-white text-gray-900 hover:opacity-90 transition-opacity">
                      {ctaLabel} <ChevronRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-bold text-xs px-4 py-2.5 rounded-full w-fit mt-1 bg-white/10 text-white/60">{ctaLabel}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => { goTo(i); startTimer(); }}
            className={`rounded-full transition-all duration-300 ${i === slide ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/60"}`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button onClick={() => paginate(-1)} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 items-center justify-center text-white backdrop-blur-sm transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => paginate(1)} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 items-center justify-center text-white backdrop-blur-sm transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className={`absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t to-transparent pointer-events-none z-10 ${isDark ? "from-gray-950" : "from-gray-50"}`} />
    </section>
  );
}
