"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  X, ChevronLeft, ChevronRight, Store, Bell,
  ShoppingCart, Star, MapPin, Clock, Package,
  MessageCircle,
} from "lucide-react";

const TOUR_KEY = "warning-comercio-tour-v2";

// ── Ilustraciones por paso ───────────────────────────────────────────────────

function IlluPerfil() {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-56 bg-gray-800/70 rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm">
        <div className="h-14 bg-gradient-to-br from-amber-900/70 to-orange-900/40 relative">
          <div className="absolute -bottom-5 left-3 w-10 h-10 rounded-xl bg-gray-800 border-2 border-gray-700 flex items-center justify-center shadow-lg">
            <Store className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div className="pt-6 px-3 pb-3 space-y-2">
          <div>
            <p className="text-white font-bold text-sm leading-tight">El Estribo</p>
            <p className="text-amber-400 text-[10px]">Indumentaria · Centro</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-[10px]">Belgrano 777</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span className="text-[10px]">Lun-Sáb 8:30 — 20:30</span>
            </div>
          </div>
          <div className="h-7 rounded-full flex items-center justify-center gap-1.5" style={{ background: "#25D366" }}>
            <WaIcon className="w-3.5 h-3.5 text-white" />
            <p className="text-white text-[10px] font-bold">Contactar por WhatsApp</p>
          </div>
          <div className="flex gap-1 pt-0.5">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">★ FOUNDER</span>
            <span className="text-[9px] px-2 py-0.5 rounded-md bg-yellow-400/15 text-yellow-300 border border-yellow-400/20 flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" /> 4.9
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IlluCatalogo() {
  const products = [
    { name: "Remera básica", price: "$18.500", hue: "bg-blue-500/40" },
    { name: "Jean slim fit", price: "$42.000", hue: "bg-indigo-500/40" },
    { name: "Campera denim", price: "$68.000", hue: "bg-purple-500/40" },
    { name: "Calzado sport", price: "$55.000", hue: "bg-pink-500/40" },
  ];
  return (
    <div className="flex justify-center items-center h-full px-6">
      <div className="grid grid-cols-2 gap-2 w-52">
        {products.map((p, i) => (
          <div key={i} className="bg-gray-800/70 rounded-xl border border-white/10 overflow-hidden shadow-lg">
            <div className={`h-10 ${p.hue} flex items-center justify-center`}>
              <Package className="w-4 h-4 text-white/50" />
            </div>
            <div className="px-2 py-1.5">
              <p className="text-white text-[9px] font-bold leading-tight line-clamp-1">{p.name}</p>
              <p className="text-green-400 text-[9px] font-black mt-0.5">{p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IlluPedido() {
  return (
    <div className="flex justify-center items-center h-full px-6">
      <div className="w-52 space-y-2">
        <div className="bg-gray-800/70 rounded-xl border border-white/10 p-3 space-y-2 shadow-lg">
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-white text-[10px] font-bold">Mi pedido</p>
          </div>
          {[
            { name: "Remera básica talle M", qty: "x2", price: "$37.000" },
            { name: "Jean slim 32", qty: "x1", price: "$42.000" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between border-t border-white/5 pt-1.5">
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-[9px] truncate">{item.name}</p>
                <p className="text-gray-500 text-[8px]">{item.qty}</p>
              </div>
              <p className="text-green-400 text-[9px] font-bold ml-2 flex-shrink-0">{item.price}</p>
            </div>
          ))}
          <div className="flex justify-between border-t border-white/10 pt-1.5">
            <p className="text-gray-400 text-[9px]">Total</p>
            <p className="text-white text-[9px] font-black">$79.000</p>
          </div>
        </div>
        <div className="h-7 rounded-full flex items-center justify-center gap-1.5 shadow-lg" style={{ background: "#25D366" }}>
          <WaIcon className="w-3 h-3 text-white" />
          <p className="text-white text-[10px] font-bold">Enviar pedido por WA</p>
        </div>
      </div>
    </div>
  );
}

function IlluPost() {
  return (
    <div className="flex justify-center items-center h-full px-6">
      <div className="w-52 bg-gray-800/70 rounded-2xl border border-white/10 overflow-hidden shadow-lg">
        <div className="h-14 bg-gradient-to-br from-purple-800/80 to-indigo-800/60 flex items-center justify-center relative">
          <span className="text-2xl">🏷️</span>
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-purple-500/80 backdrop-blur-sm rounded-full">
            <p className="text-[8px] text-white font-bold">OFERTA</p>
          </div>
        </div>
        <div className="p-2.5">
          <p className="text-white text-[11px] font-bold leading-tight">30% off en toda la línea de verano</p>
          <p className="text-gray-400 text-[9px] mt-1">Solo este fin de semana. Hasta agotar stock.</p>
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-amber-500/30 flex items-center justify-center">
                <Store className="w-2.5 h-2.5 text-amber-400" />
              </div>
              <p className="text-[9px] text-gray-400">El Estribo</p>
            </div>
            <div className="flex items-center gap-2.5 text-gray-500">
              <span className="flex items-center gap-0.5 text-[9px]">♡ 24</span>
              <span className="flex items-center gap-0.5 text-[9px]">↗ 8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IlluSumate() {
  return (
    <div className="flex justify-center items-center h-full px-6">
      <div className="w-52 space-y-2">
        <div className="relative bg-amber-500/10 border border-amber-500/50 rounded-xl p-3 flex items-center gap-2.5 shadow-lg">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-white text-[11px] font-bold">Sumate</p>
            <p className="text-white/60 text-[9px]">Recibí todas las novedades</p>
          </div>
          <div className="absolute -inset-px rounded-xl border border-amber-400/40 animate-ping pointer-events-none" />
        </div>
        <div className="bg-gray-800/60 rounded-xl border border-white/5 p-2.5 space-y-1.5">
          <p className="text-gray-400 text-[8px] uppercase tracking-wider font-semibold">Tus notificaciones</p>
          {[
            { e: "🏷️", t: "El Estribo publicó una oferta" },
            { e: "🎁", t: "Sorteo activo · participá ya" },
            { e: "📢", t: "Nueva colección disponible" },
          ].map((n, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm flex-shrink-0">{n.e}</span>
              <p className="text-white/80 text-[9px] leading-tight">{n.t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IlluFounder() {
  const items = [
    { name: "El Estribo", sub: "Indumentaria", badge: "FOUNDER", star: "4.9", top: true },
    { name: "Nexo Pinturería", sub: "Pinturería", badge: "FOUNDER", star: "4.8", top: true },
    { name: "Otro comercio", sub: "Rubro", badge: "PREMIUM", star: "", top: false },
  ];
  return (
    <div className="flex justify-center items-center h-full px-6">
      <div className="w-52 space-y-1.5">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[9px] text-gray-500 uppercase tracking-wider">Destacados</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        {items.map((c, i) => (
          <div
            key={i}
            className={`bg-gray-800/70 rounded-xl border px-3 py-2 flex items-center justify-between shadow-md transition-opacity ${c.top ? "border-white/15 opacity-100" : "border-white/5 opacity-45"}`}
          >
            <div className="flex items-center gap-2">
              {i === 0 && <span className="text-[10px]">🥇</span>}
              {i === 1 && <span className="text-[10px]">🥈</span>}
              {i === 2 && <span className="text-[10px]">—</span>}
              <div>
                <p className="text-white text-[10px] font-bold leading-none">{c.name}</p>
                <p className="text-gray-500 text-[8px] mt-0.5">{c.sub}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {c.star && <span className="text-[9px] text-yellow-400">★ {c.star}</span>}
              <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md border ${c.badge === "FOUNDER" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30"}`}>
                {c.badge}
              </span>
            </div>
          </div>
        ))}
        <p className="text-center text-[9px] text-amber-300/80 font-semibold pt-1">⬆ Founders aparecen primero</p>
      </div>
    </div>
  );
}

// ── WhatsApp SVG ─────────────────────────────────────────────────────────────

function WaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ── Datos de cada paso ───────────────────────────────────────────────────────

const STEPS = [
  {
    id: "perfil",
    gradient: "from-blue-950 via-indigo-900 to-slate-900",
    accent: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    badge: "PERFIL PÚBLICO",
    title: "Tu comercio visible para toda Reconquista",
    description: "Creás un perfil con nombre, rubro, dirección, horario y foto. Los vecinos te encuentran en el directorio y pueden contactarte por WhatsApp con un toque.",
    Illu: IlluPerfil,
  },
  {
    id: "catalogo",
    gradient: "from-amber-950 via-orange-900 to-yellow-950",
    accent: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    badge: "CATÁLOGO DE PRODUCTOS",
    title: "Exhibí lo que vendés, 24/7",
    description: "Subí tus productos con nombre, foto y precio. Tu vidriera digital está disponible todo el tiempo, sin que tengas que atender a nadie.",
    Illu: IlluCatalogo,
  },
  {
    id: "pedidos",
    gradient: "from-emerald-950 via-green-900 to-teal-950",
    accent: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    badge: "PEDIDOS POR WHATSAPP",
    title: "Recibí pedidos directo en tu celular",
    description: "Los clientes arman el carrito desde tu catálogo y te lo envían al WhatsApp con un toque. Sin apps de delivery, sin comisiones, sin intermediarios.",
    Illu: IlluPedido,
  },
  {
    id: "posts",
    gradient: "from-purple-950 via-violet-900 to-indigo-950",
    accent: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    badge: "PUBLICACIONES",
    title: "Publicá y llegá a todos tus seguidores",
    description: "Compartí ofertas, novedades y sorteos. Cada publicación aparece en el feed de la app y notifica a todos los usuarios que se sumaron a tu comercio.",
    Illu: IlluPost,
  },
  {
    id: "sumate",
    gradient: "from-violet-950 via-purple-900 to-pink-950",
    accent: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    badge: "SEGUIDORES",
    title: "Construí tu audiencia propia",
    description: "Los clientes tocan 'Sumate' en tu perfil para seguirte. Cada vez que publicás, reciben una notificación. Es como tener suscriptores, sin pagar por publicidad.",
    Illu: IlluSumate,
  },
  {
    id: "founder",
    gradient: "from-amber-950 via-yellow-900 to-orange-950",
    accent: "bg-amber-400/20 text-amber-300 border-amber-400/30",
    badge: "INSIGNIA FOUNDER",
    title: "Ser Founder es aparecer primero, siempre",
    description: "La insignia Founder es permanente y te da máxima visibilidad en toda la app. Aparecés primero en búsquedas, en el home y en la sección Comercios Destacados.",
    Illu: IlluFounder,
  },
];

// ── Animaciones ──────────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: 40, scale: 0.97 },
};

const contentVariants = {
  enter: (d: number) => ({ x: d > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d > 0 ? -24 : 24, opacity: 0 }),
};

// ── Componente principal ─────────────────────────────────────────────────────

interface ComercioTourProps {
  autoShow?: boolean;
}

export default function ComercioTour({ autoShow = true }: ComercioTourProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    if (!autoShow) return;
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [autoShow]);

  function close() {
    localStorage.setItem(TOUR_KEY, "1");
    setOpen(false);
  }

  function goTo(i: number) {
    setDir(i > step ? 1 : -1);
    setStep(i);
  }

  function next() {
    if (step < STEPS.length - 1) goTo(step + 1);
    else close();
  }

  function prev() {
    if (step > 0) goTo(step - 1);
  }

  function reopen() {
    setStep(0);
    setDir(1);
    setOpen(true);
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Botón flotante para re-abrir */}
      {!open && (
        <button
          onClick={reopen}
          title="Ver tour del comercio"
          className="fixed bottom-6 right-4 z-40 w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/50 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
              onClick={close}
            />

            {/* Card — bottom sheet en mobile, modal centrado en desktop */}
            <motion.div
              key="card"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-50
                inset-x-0 bottom-0 rounded-t-3xl overflow-hidden shadow-2xl max-h-[88svh]
                md:inset-auto md:bottom-auto md:rounded-3xl md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] md:max-h-none"
            >
              {/* Handle — solo mobile */}
              <div className="md:hidden flex justify-center pt-3 pb-1 bg-gray-950">
                <div className="w-10 h-1 rounded-full bg-gray-700" />
              </div>

              {/* Área visual con ilustración */}
              <div className={`relative h-36 md:h-48 bg-gradient-to-br ${current.gradient} overflow-hidden`}>
                <current.Illu />

                {/* Barra de progreso */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
                  <motion.div
                    className="h-full bg-white/50"
                    animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>

                {/* Paso X/N */}
                <div className="absolute top-3 left-4 text-[10px] text-white/50 font-semibold tabular-nums">
                  {step + 1} / {STEPS.length}
                </div>

                {/* Botón cerrar */}
                <button
                  onClick={close}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Contenido textual */}
              <div className="bg-gray-950 px-5 py-4">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    variants={contentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border mb-2 ${current.accent}`}>
                      {current.badge}
                    </span>
                    <h3 className="text-white font-black text-[17px] leading-snug mb-1.5">
                      {current.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {current.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Navegación */}
                <div className="flex items-center justify-between mt-4">
                  {/* Dots */}
                  <div className="flex gap-1.5">
                    {STEPS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`rounded-full transition-all duration-300 ${
                          i === step
                            ? "w-5 h-2 bg-white"
                            : "w-2 h-2 bg-gray-700 hover:bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Botones */}
                  <div className="flex items-center gap-2">
                    {step > 0 && (
                      <button
                        onClick={prev}
                        className="w-9 h-9 rounded-full border border-gray-800 hover:border-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    {isLast ? (
                      <Link
                        href="/comercio/nuevo"
                        onClick={close}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-sm rounded-full transition-colors"
                      >
                        Registrar mi comercio
                      </Link>
                    ) : (
                      <button
                        onClick={next}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-full transition-colors"
                      >
                        Siguiente <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
