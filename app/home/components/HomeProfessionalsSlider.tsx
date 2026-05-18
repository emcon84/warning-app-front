"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Star, ChevronRight, ChevronLeft } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { resolvePhotoUrl } from "@/lib/utils/photo";
import {
  PRO_PROMOS, PRO_GRADIENTS, buildMixed, slideVariants,
} from "@/lib/constants/homeConstants";
import type { Professional } from "@/types";

interface Props {
  professionals: Professional[];
}

export function HomeProfessionalsSlider({ professionals }: Props) {
  const { isDark } = useTheme();
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const swipeX = useRef(0);

  const disponibles = professionals.filter(p => p.disponible);
  const proItems = disponibles.slice(0, 8);
  const slides = buildMixed(proItems, PRO_PROMOS, 3);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setDir(1);
      setSlide(p => (p + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-3">
        <p className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Profesionales Destacados</p>
        <Link href="/oficios" className={`text-xs flex items-center gap-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
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

            const pro = item.data;
            const photoSrc = pro.foto ? resolvePhotoUrl(pro.foto) : null;
            const gradient = PRO_GRADIENTS[slide % PRO_GRADIENTS.length];
            return (
              <motion.div
                key={pro.id}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Link href={`/profesional/${pro.slug}`} className="block h-full">
                  <div className={`h-full bg-gradient-to-br ${gradient} flex`}>
                    <div className="w-2/5 flex items-center justify-center p-5">
                      <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-white/20 shadow-xl relative">
                        {photoSrc ? (
                          <Image src={photoSrc} alt={pro.nombre} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-white/10">
                            {pro.nombre[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-2 pr-5 py-5">
                      <div>
                        <p className="text-white font-bold text-lg leading-tight">{pro.nombre} {pro.apellido}</p>
                        <p className="text-white/70 text-sm capitalize mt-0.5">{pro.oficios[0]}</p>
                      </div>
                      {pro.ratingCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm text-yellow-400 font-semibold">{pro.ratingAvg.toFixed(1)}</span>
                          <span className="text-white/40 text-xs">({pro.ratingCount})</span>
                        </div>
                      )}
                      {(pro.recommendations ?? 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 1.99l-3.714 5.06a2 2 0 00-.373 1.169V19a2 2 0 002 2h.095c.497 0 .905-.402.905-.9V16.91c0-.333.215-.627.527-.738l2.527-.946" />
                          </svg>
                          <span className="text-xs text-amber-400 font-semibold">{pro.recommendations} recomendaciones</span>
                        </div>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/80 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 w-fit mt-1">
                        Ver perfil <ChevronRight className="w-3 h-3" />
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
