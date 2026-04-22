"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle, Wrench, GraduationCap, Store, Stethoscope,
  Pill, Star, MapPin, Phone, Wifi, Battery, Tag,
  ChevronLeft, ChevronRight, Clock, MessageCircle, Package,
  ShoppingCart,
} from "lucide-react";

// ─── Phone frame (always dark — es una pantalla) ──────────────

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-3 py-1">
      <span className="text-[8px] text-white/50 font-semibold tabular-nums">9:41</span>
      <div className="flex items-center gap-1">
        <div className="flex items-end gap-px" style={{ height: 10 }}>
          {[40, 60, 80, 100].map((h, i) => (
            <div key={i} className="w-0.5 bg-white/50 rounded-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
        <Wifi className="w-2.5 h-2.5 text-white/50 ml-0.5" />
        <Battery className="w-3 h-2 text-white/50" />
      </div>
    </div>
  );
}

function PhoneFrame({ children, glow }: { children: React.ReactNode; glow: string }) {
  return (
    <div className="relative shrink-0 mx-auto" style={{ width: 210, height: 430 }}>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-25"
        style={{ background: glow, transition: "background 0.7s ease" }}
      />
      <div className="relative h-full rounded-[40px] border-[3px] border-gray-700 bg-gray-900 overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[52px] h-[16px] bg-black rounded-b-2xl z-20" />
        <div className="h-full flex flex-col">
          <div className="pt-5"><StatusBar /></div>
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Mockups ──────────────────────────────────────────────────

function ReportesMockup() {
  const items = [
    { label: "Bache en Av. Iriondo", barrio: "Centro", time: "2 hs", color: "#f97316" },
    { label: "Inundacion calle Caseros", barrio: "B. Norte", time: "5 hs", color: "#3b82f6" },
    { label: "Alumbrado publico roto", barrio: "V. del Parque", time: "Ayer", color: "#eab308" },
  ];
  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-[11px] font-bold">Reportes</span>
        <span className="text-[8px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-semibold">Reconquista</span>
      </div>
      {items.map((r, i) => (
        <div key={i} className="mb-2 bg-gray-800/80 rounded-xl p-2.5 flex items-start gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${r.color}20` }}>
            <AlertTriangle className="w-3 h-3" style={{ color: r.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-[9px] font-semibold truncate">{r.label}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-2 h-2 text-gray-500 shrink-0" />
              <span className="text-gray-500 text-[8px]">{r.barrio}</span>
              <span className="text-gray-700 text-[8px]">·</span>
              <Clock className="w-2 h-2 text-gray-600 shrink-0" />
              <span className="text-gray-500 text-[8px]">{r.time}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl h-14 flex items-center justify-center gap-1.5 mt-1">
        <MapPin className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-gray-400 text-[9px]">Mapa interactivo</span>
      </div>
    </div>
  );
}

function OficiosMockup() {
  const pros = [
    { name: "Juan G.", oficio: "Plomero", rating: 4.8 },
    { name: "Carlos R.", oficio: "Electricista", rating: 4.9 },
    { name: "Miguel T.", oficio: "Albanil", rating: 4.7 },
  ];
  return (
    <div className="px-3 py-2">
      <div className="flex gap-1 mb-3 bg-gray-800/60 rounded-xl p-1">
        <div className="flex-1 bg-white rounded-lg py-1.5 flex items-center justify-center gap-1">
          <Wrench className="w-3 h-3 text-gray-900" />
          <span className="text-[9px] font-bold text-gray-900">Oficios</span>
        </div>
        <div className="flex-1 py-1.5 flex items-center justify-center gap-1">
          <GraduationCap className="w-3 h-3 text-gray-500" />
          <span className="text-[9px] text-gray-500">Profesionales</span>
        </div>
      </div>
      {pros.map((p, i) => (
        <div key={i} className="mb-2 bg-gray-800/80 rounded-xl p-2.5 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-900/50 flex items-center justify-center shrink-0">
            <span className="text-purple-300 text-[11px] font-black">{p.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[9px] font-semibold">{p.name}</p>
            <p className="text-purple-400 text-[8px] capitalize">{p.oficio}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-400 text-[9px] font-semibold">{p.rating}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfesionalesMockup() {
  const pros = [
    { name: "Hernan Z.", oficio: "Contador", rating: 4.9 },
    { name: "Ana L.", oficio: "Abogada", rating: 0 },
    { name: "Walter F.", oficio: "Arquitecto", rating: 4.6 },
  ];
  return (
    <div className="px-3 py-2">
      <div className="flex gap-1 mb-3 bg-gray-800/60 rounded-xl p-1">
        <div className="flex-1 py-1.5 flex items-center justify-center gap-1">
          <Wrench className="w-3 h-3 text-gray-500" />
          <span className="text-[9px] text-gray-500">Oficios</span>
        </div>
        <div className="flex-1 bg-white rounded-lg py-1.5 flex items-center justify-center gap-1">
          <GraduationCap className="w-3 h-3 text-gray-900" />
          <span className="text-[9px] font-bold text-gray-900">Profesionales</span>
        </div>
      </div>
      {pros.map((p, i) => (
        <div key={i} className="mb-2 bg-gray-800/80 rounded-xl p-2.5 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-900/50 flex items-center justify-center shrink-0">
            <span className="text-blue-300 text-[11px] font-black">{p.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[9px] font-semibold">{p.name}</p>
            <p className="text-blue-400 text-[8px]">{p.oficio}</p>
          </div>
          {p.rating > 0 && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 text-[9px] font-semibold">{p.rating}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ComerciosMockup() {
  const featured = [
    { name: "Ferreteria El Clavo", color: "#f59e0b" },
    { name: "Panaderia La Espiga", color: "#84cc16" },
    { name: "Ropa y Moda", color: "#ec4899" },
  ];
  const list = [
    { name: "Ferreteria El Clavo", rubro: "Ferreteria", premium: true },
    { name: "Panaderia La Espiga", rubro: "Panaderia", premium: false },
  ];
  return (
    <div className="px-3 py-2">
      <p className="text-[8px] text-gray-500 font-semibold uppercase tracking-wide mb-2">Destacados</p>
      <div className="flex gap-3 mb-3 justify-center">
        {featured.map((f, i) => (
          <div key={i} className="flex flex-col items-center gap-1" style={{ width: 44 }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black" style={{ background: `${f.color}25`, color: f.color }}>
              {f.name[0]}
            </div>
            <span className="text-[7px] text-gray-500 text-center leading-tight">{f.name.split(" ")[0]}</span>
          </div>
        ))}
      </div>
      {list.map((c, i) => (
        <div key={i} className="mb-2 bg-gray-800/80 rounded-xl p-2.5 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-900/40 flex items-center justify-center shrink-0">
            <span className="text-amber-400 text-[11px] font-black">{c.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[9px] font-semibold truncate">{c.name}</p>
            <div className="flex items-center gap-1">
              <Tag className="w-2 h-2 text-amber-400 shrink-0" />
              <p className="text-amber-400 text-[8px]">{c.rubro}</p>
            </div>
          </div>
          {c.premium && <span className="text-[7px] bg-amber-500 text-white rounded px-1.5 py-0.5 font-bold shrink-0">PRO</span>}
        </div>
      ))}
    </div>
  );
}

function MedicosMockup() {
  const medicos = [
    { name: "Dr. Garcia", spec: "Cardiologia", os: "IAPOS" },
    { name: "Dra. Sosa", spec: "Clinica Medica", os: "PAMI" },
    { name: "Dr. Perez", spec: "Pediatria", os: "IAPOS" },
  ];
  return (
    <div className="px-3 py-2">
      <div className="flex gap-1.5 mb-3">
        {["IAPOS", "PAMI", "Todas"].map((pill, i) => (
          <div key={i} className={`px-2.5 py-1 rounded-full text-[8px] font-semibold ${i === 0 ? "bg-cyan-500/20 text-cyan-400" : "bg-gray-800 text-gray-500"}`}>
            {pill}
          </div>
        ))}
      </div>
      {medicos.map((d, i) => (
        <div key={i} className="mb-2 bg-gray-800/80 rounded-xl p-2.5 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-900/50 flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[9px] font-semibold">{d.name}</p>
            <p className="text-cyan-400 text-[8px]">{d.spec}</p>
          </div>
          <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${d.os === "IAPOS" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>{d.os}</span>
        </div>
      ))}
    </div>
  );
}

function FarmaciasMockup() {
  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-green-400 text-[9px] font-semibold">Turno activo ahora</span>
      </div>
      <div className="bg-gray-800/80 rounded-xl p-3 mb-2">
        <div className="flex items-start gap-2 mb-2.5">
          <div className="w-9 h-9 rounded-xl bg-green-900/50 flex items-center justify-center shrink-0">
            <Pill className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-white text-[10px] font-bold">Farmacia Fernandez</p>
            <span className="text-[7px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-semibold">De turno</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5"><MapPin className="w-2.5 h-2.5 text-gray-500 shrink-0" /><span className="text-gray-400 text-[8px]">Av. Iriondo 1234, Centro</span></div>
          <div className="flex items-center gap-1.5"><Phone className="w-2.5 h-2.5 text-gray-500 shrink-0" /><span className="text-gray-400 text-[8px]">0482-12345</span></div>
          <div className="flex items-center gap-1.5"><Clock className="w-2.5 h-2.5 text-gray-500 shrink-0" /><span className="text-gray-400 text-[8px]">Hasta las 8:00 hs</span></div>
        </div>
      </div>
      <div className="bg-gray-800/40 rounded-xl p-2 border border-gray-700/50">
        <p className="text-gray-600 text-[7px] text-center">Proxima: Farmacia Central · Del Pueblo</p>
      </div>
    </div>
  );
}

function OfertasMockup() {
  const ofertas = [
    { super: "Vital", producto: "Aceite girasol 1.5L", precio: "$2.490", tag: "20% OFF" },
    { super: "Jumbo", producto: "Yerba mate 1kg", precio: "$3.200", tag: "2x1" },
    { super: "Carrefour", producto: "Leche entera x6", precio: "$4.890", tag: "-15%" },
  ];
  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-[11px] font-bold">Ofertas</span>
        <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-semibold">Esta semana</span>
      </div>
      {ofertas.map((o, i) => (
        <div key={i} className="mb-2 bg-gray-800/80 rounded-xl p-2.5 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-yellow-900/40 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[9px] font-semibold truncate">{o.producto}</p>
            <p className="text-gray-500 text-[8px]">{o.super}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-white text-[9px] font-bold">{o.precio}</p>
            <span className="text-[7px] bg-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded font-semibold">{o.tag}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Slides config ─────────────────────────────────────────────

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
};

const SLIDES: Slide[] = [
  { id: "reportes", badge: "Reportes ciudadanos", badgeCls: "bg-orange-500/15 text-orange-500 dark:text-orange-400 border-orange-500/30", headline: "Mantenete informado", headlineSuffix: "de tu barrio", accentCls: "text-orange-500 dark:text-orange-400", sub: "Reporta situaciones en la via publica de Reconquista. Los vecinos y el municipio lo ven en tiempo real.", cta: { label: "Ver reportes", href: "/app" }, glow: "#f97316", dotActiveCls: "bg-orange-500 dark:bg-orange-400" },
  { id: "oficios", badge: "Oficios", badgeCls: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30", headline: "El profesional que necesitas,", headlineSuffix: "en tu ciudad", accentCls: "text-purple-600 dark:text-purple-400", sub: "Plomeros, electricistas, albaniles y mas oficios de Reconquista. Perfil verificado y contacto directo.", cta: { label: "Ver oficios", href: "/oficios" }, glow: "#a855f7", dotActiveCls: "bg-purple-600 dark:bg-purple-400" },
  { id: "profesionales", badge: "Profesionales", badgeCls: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30", headline: "Contadores, abogados y mas,", headlineSuffix: "sin intermediarios", accentCls: "text-blue-600 dark:text-blue-400", sub: "Directorio de profesionales de Reconquista con contacto directo por chat. Sin comisiones.", cta: { label: "Ver profesionales", href: "/oficios" }, glow: "#3b82f6", dotActiveCls: "bg-blue-600 dark:bg-blue-400" },
  { id: "comercios", badge: "Comercios locales", badgeCls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30", headline: "Los negocios de Reconquista", headlineSuffix: "en tu bolsillo", accentCls: "text-amber-600 dark:text-amber-400", sub: "Encontra comercios locales, sus productos y ofertas. Contacto directo por WhatsApp.", cta: { label: "Ver comercios", href: "/comercios" }, glow: "#f59e0b", dotActiveCls: "bg-amber-600 dark:bg-amber-400" },
  { id: "medicos", badge: "Medicos IAPOS y PAMI", badgeCls: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30", headline: "Tu medico de cabecera", headlineSuffix: "a un toque", accentCls: "text-cyan-600 dark:text-cyan-400", sub: "Directorio completo de medicos en Reconquista con especialidad, obra social y ubicacion.", cta: { label: "Ver medicos", href: "/medicos" }, glow: "#06b6d4", dotActiveCls: "bg-cyan-600 dark:bg-cyan-400" },
  { id: "farmacias", badge: "Farmacias de turno", badgeCls: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30", headline: "Que farmacia esta", headlineSuffix: "de turno hoy", accentCls: "text-green-600 dark:text-green-400", sub: "Sabe en segundos que farmacia de Reconquista esta disponible. Informacion actualizada diariamente.", cta: { label: "Ver farmacias", href: "/farmacias" }, glow: "#22c55e", dotActiveCls: "bg-green-600 dark:bg-green-400" },
  { id: "ofertas", badge: "Ofertas de supermercados", badgeCls: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30", headline: "Las mejores ofertas", headlineSuffix: "de Reconquista", accentCls: "text-yellow-600 dark:text-yellow-400", sub: "Ofertas y promociones de los supermercados de Reconquista en un solo lugar. Ahorra en tus compras.", cta: { label: "Ver ofertas", href: "/ofertas" }, glow: "#eab308", dotActiveCls: "bg-yellow-600 dark:bg-yellow-400" },
];

function getMockup(id: string) {
  switch (id) {
    case "reportes": return <ReportesMockup />;
    case "oficios": return <OficiosMockup />;
    case "profesionales": return <ProfesionalesMockup />;
    case "comercios": return <ComerciosMockup />;
    case "medicos": return <MedicosMockup />;
    case "farmacias": return <FarmaciasMockup />;
    case "ofertas": return <OfertasMockup />;
    default: return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);

  const goTo = useCallback((idx: number) => {
    setVisible(false);
    setTimeout(() => { setCurrent(idx); setVisible(true); }, 220);
  }, []);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  const slide = SLIDES[current];
  const fadeStyle = { opacity: visible ? 1 : 0, transition: "opacity 0.22s ease" };

  return (
    <div
      className="relative flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 py-16 lg:py-24 px-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const d = touchStartX.current - e.changedTouches[0].clientX; if (Math.abs(d) > 50) d > 0 ? next() : prev(); }}
    >
      {/* Text */}
      <div className="flex-1 max-w-lg text-center lg:text-left order-2 lg:order-1" style={fadeStyle}>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-5 ${slide.badgeCls}`}>
          {slide.badge}
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-[1.1] mb-5 tracking-tight">
          {slide.headline}{" "}
          <span className={slide.accentCls}>{slide.headlineSuffix}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8">
          {slide.sub}
        </p>
        <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
          <Link href={slide.cta.href} className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-colors text-sm">
            {slide.cta.label}
          </Link>
          <Link href="/app" className="inline-flex items-center gap-2 px-7 py-3.5 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold rounded-2xl transition-colors text-sm">
            Abrir la app
          </Link>
        </div>
        {/* Dots + arrows */}
        <div className="flex items-center gap-3 mt-10 justify-center lg:justify-start">
          <button onClick={prev} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center transition-colors text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={`rounded-full transition-all duration-300 ${i === current ? `w-6 h-2 ${slide.dotActiveCls}` : "w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-500"}`} />
            ))}
          </div>
          <button onClick={next} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center transition-colors text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Phone */}
      <div className="order-1 lg:order-2 shrink-0" style={fadeStyle}>
        <PhoneFrame glow={slide.glow}>{getMockup(slide.id)}</PhoneFrame>
      </div>
    </div>
  );
}
