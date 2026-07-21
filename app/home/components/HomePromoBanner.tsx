"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { slideVariants } from "@/lib/constants/homeConstants";

const SLIDE_COUNT = 3;

export function HomePromoBanner() {
  const [slide, setSlide] = useState(0);
  const swipeX = useRef(0);

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % SLIDE_COUNT), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="px-0 mb-6">
      <div
        className="relative overflow-hidden rounded-2xl h-48 md:h-52 touch-pan-y"
        onPointerDown={(e) => { swipeX.current = e.clientX; }}
        onPointerUp={(e) => {
          const d = swipeX.current - e.clientX;
          if (d > 50) setSlide(p => (p + 1) % SLIDE_COUNT);
          else if (d < -50) setSlide(p => (p - 1 + SLIDE_COUNT) % SLIDE_COUNT);
        }}
      >
        <AnimatePresence mode="wait" initial={false}>

          {/* Slide 1: Pedidos por WhatsApp */}
          {slide === 0 && (
            <motion.div key="whatsapp" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
              <div className="relative w-full h-full">
                <Image
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop&q=80"
                  alt=""
                  fill
                  className="object-cover object-center"
                  unoptimized
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/98 via-emerald-950/88 to-emerald-900/55" />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 text-white opacity-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <div className="relative z-10 h-full flex flex-col justify-center px-5 gap-1.5 max-w-[72%] md:max-w-[58%]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "#25D366" }}>
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">PEDIDOS POR WHATSAPP</span>
                </div>
                <h3 className="text-white font-bold text-base md:text-lg leading-tight">Pedí en tus locales favoritos</h3>
                <p className="text-white/70 text-xs leading-relaxed line-clamp-2">Armá tu pedido y mandalo directo al WhatsApp del comercio.</p>
                <Link href="/comercios" className="inline-flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-full w-fit transition-opacity hover:opacity-90 text-white" style={{ background: "#25D366" }}>
                  Ver comercios <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Slide 2: Red Social Local */}
          {slide === 1 && (
            <motion.div key="comunidad" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
              <div className="absolute right-2 md:right-6 top-3 md:top-1/2 md:-translate-y-1/2 flex flex-col gap-1 md:gap-2 z-10 pointer-events-none">
                <div className="flex items-center gap-1.5 md:gap-2.5 bg-white/12 backdrop-blur-sm rounded-xl px-2 md:px-4 py-1.5 md:py-3 w-32 md:w-52">
                  <span className="text-[11px] md:text-xl flex-shrink-0">🏷️</span>
                  <div><p className="text-[7px] md:text-[11px] text-white font-bold leading-none">El Estribo</p><p className="text-[6px] md:text-[9px] text-white/60 mt-0.5">Nueva oferta publicada</p></div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2.5 bg-white/12 backdrop-blur-sm rounded-xl px-2 md:px-4 py-1.5 md:py-3 w-28 md:w-44 ml-3 md:ml-6">
                  <span className="text-[11px] md:text-xl flex-shrink-0">🎁</span>
                  <div><p className="text-[7px] md:text-[11px] text-white font-bold leading-none">Bayer Farm.</p><p className="text-[6px] md:text-[9px] text-white/60 mt-0.5">Sorteo activo</p></div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2.5 bg-white/12 backdrop-blur-sm rounded-xl px-2 md:px-4 py-1.5 md:py-3 w-24 md:w-48">
                  <span className="text-[11px] md:text-xl flex-shrink-0">📢</span>
                  <div><p className="text-[7px] md:text-[11px] text-white font-bold leading-none">Devcom</p><p className="text-[6px] md:text-[9px] text-white/60 mt-0.5">Nuevo post</p></div>
                </div>
              </div>
              <div className="relative z-10 h-full flex flex-col justify-center px-5 gap-1.5 max-w-[62%] md:max-w-[55%]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-300/80">RED SOCIAL LOCAL</span>
                <h3 className="text-white font-bold text-base md:text-lg leading-tight">Seguí a tus comercios favoritos</h3>
                <p className="text-white/70 text-xs leading-relaxed line-clamp-2">Como seguir una cuenta de Instagram, pero de los negocios de tu ciudad.</p>
                <Link href="/comercios" className="inline-flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-full w-fit bg-purple-500 hover:bg-purple-400 text-white transition-colors">
                  Explorar <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Slide 3: Cómo sumarse */}
          {slide === 2 && (
            <motion.div key="sumate" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-violet-900">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
              <div className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-10 flex flex-col items-end gap-1.5 md:gap-3 pointer-events-none">
                <div className="flex items-center gap-1 md:gap-3 mb-0.5">
                  {[{ e: "🔍", l: "Buscá" }, { e: "🏪", l: "Entrá" }, { e: "🔔", l: "Sumate" }].map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5 md:gap-1">
                      <div className="w-7 h-7 md:w-12 md:h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-sm md:text-2xl">{s.e}</div>
                      <span className="text-[5.5px] md:text-[9px] text-white/50 font-semibold">{s.l}</span>
                    </div>
                  ))}
                </div>
                <div className="relative w-32 md:w-52">
                  <div className="rounded-xl border border-amber-500/60 bg-amber-500/12 backdrop-blur-sm px-2.5 md:px-4 py-2 md:py-3 flex items-center gap-1.5 md:gap-3">
                    <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 md:w-4 md:h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] md:text-sm text-white font-bold leading-none">Sumate</p>
                      <p className="text-[6px] md:text-[10px] text-white/50 mt-0.5">Recibí novedades</p>
                    </div>
                    <span className="text-amber-400 text-[10px] md:text-base">›</span>
                  </div>
                  <div className="absolute -inset-0.5 rounded-xl border border-amber-400/50 animate-ping pointer-events-none" />
                </div>
                <p className="text-[9px] md:text-xs text-amber-300 font-bold">👆 tocá acá</p>
              </div>
              <div className="relative z-10 h-full flex flex-col justify-center px-5 gap-1.5 max-w-[58%] md:max-w-[52%]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-300/70">ASI DE FACIL</span>
                <h3 className="text-white font-bold text-base md:text-lg leading-tight">Buscá el comercio y tocá Sumate</h3>
                <p className="text-white/70 text-xs leading-relaxed line-clamp-2">Abrí su perfil y tocá el botón para recibir todas sus novedades.</p>
                <Link href="/comercios" className="inline-flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-full w-fit bg-blue-500 hover:bg-blue-400 text-white transition-colors">
                  Ver comercios <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-3 left-5 flex gap-1.5 z-20">
          {[0, 1, 2].map(i => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all duration-300 ${i === slide ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
