"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { resolvePhotoUrl } from "@/lib/utils/photo";
import {
  COM_PROMOS, COMERCIO_BG_GRADIENTS, buildMixed, slideVariants,
} from "@/lib/constants/homeConstants";
import type { Comercio } from "@/types";

interface Props {
  comercios: Comercio[];
}

export function HomeStoresSlider({ comercios }: Props) {
  const { isDark } = useTheme();
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const swipeX = useRef(0);

  const featured = comercios.filter(c => c.activo && (c.isPremium || c.isFounder));
  const slides = buildMixed(featured, COM_PROMOS, 2);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setDir(1);
      setSlide(p => (p + 1) % slides.length);
    }, 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-3">
        <p className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Comercios Destacados</p>
        <Link href="/comercios" className={`text-xs flex items-center gap-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
          Ver todos <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div
        className="relative rounded-2xl overflow-hidden h-44 md:h-52 touch-pan-y"
        onPointerDown={(e) => { swipeX.current = e.clientX; }}
        onPointerUp={(e) => {
          const d = swipeX.current - e.clientX;
          if (d > 50) { setDir(1); setSlide(p => (p + 1) % slides.length); }
          else if (d < -50) { setDir(-1); setSlide(p => (p - 1 + slides.length) % slides.length); }
        }}
      >
        <AnimatePresence mode="wait" custom={dir}>
          {(() => {
            const item = slides[slide];
            if (!item) return null;

            if (item.type === "promo") return (
              <motion.div key={item.id} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
                <div className="h-full relative overflow-hidden">
                  <Image src={item.image} alt="" fill className="object-cover object-right" unoptimized />
                  <div className={"absolute inset-0 bg-gradient-to-r " + item.gradient} />
                  <div className="relative z-10 h-full flex flex-col justify-center px-5 gap-1.5 w-[90%] md:max-w-[60%]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{item.tag}</span>
                    <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
                    <p className="text-white/70 text-xs leading-relaxed line-clamp-2 md:line-clamp-3">{item.subtitle}</p>
                    <Link href={item.href} className={"inline-flex items-center gap-1.5 font-bold text-xs px-4 py-2.5 rounded-full w-fit mt-0.5 transition-opacity hover:opacity-90 " + item.accent}>
                      {item.cta} <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );

            const comercio = item.data;
            const logoRaw = comercio.logo || comercio.foto;
            const logoSrc = logoRaw ? resolvePhotoUrl(logoRaw) : null;
            const bgGrad = COMERCIO_BG_GRADIENTS[slide % COMERCIO_BG_GRADIENTS.length];
            return (
              <motion.div
                key={comercio.id}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Link href={`/comercio/${comercio.slug}`} className="block h-full">
                  <div className={`h-full bg-gradient-to-br ${bgGrad} flex relative overflow-hidden`}>
                    <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
                    <div className="w-2/5 flex items-center justify-center p-5">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-white shadow-xl flex items-center justify-center relative">
                        {logoSrc ? (
                          <Image src={logoSrc} alt={comercio.nombre} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                            {comercio.nombre[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-2 pr-5 py-5">
                      <div>
                        <p className="text-white font-bold text-lg leading-tight">{comercio.nombre}</p>
                        {(() => {
                          const rubros = comercio.rubro.split(/\s*\/\s*/);
                          const shown = rubros.slice(0, 2).join(" / ");
                          const extra = rubros.length - 2;
                          return (
                            <p className="text-purple-300 text-sm mt-0.5">
                              {shown}{extra > 0 && <span className="text-purple-400/60 text-xs"> +{extra} más</span>}
                            </p>
                          );
                        })()}
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {comercio.isFounder && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-500/25 text-blue-300 border border-blue-500/30">FOUNDER</span>
                        )}
                        {!comercio.isFounder && comercio.isPremium && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-300 border border-amber-500/30">PREMIUM</span>
                        )}
                        {(comercio.ratingAvg ?? 0) > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-yellow-400/20 text-yellow-300 flex items-center gap-1 border border-yellow-400/20">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {(comercio.ratingAvg ?? 0).toFixed(1)}
                          </span>
                        )}
                        {(comercio.recommendations ?? 0) > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 1.99l-3.714 5.06a2 2 0 00-.373 1.169V19a2 2 0 002 2h.095c.497 0 .905-.402.905-.9V16.91c0-.333.215-.627.527-.738l2.527-.946" />
                            </svg>
                            {comercio.recommendations}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/70 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 w-fit mt-1">
                        Ver comercio <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        <button
          onClick={() => { setDir(-1); setSlide(p => (p - 1 + slides.length) % slides.length); }}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 items-center justify-center text-white backdrop-blur-sm transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setDir(1); setSlide(p => (p + 1) % slides.length); }}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 items-center justify-center text-white backdrop-blur-sm transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
