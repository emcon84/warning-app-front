"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, MapPin, Star, Phone, Wrench, Store, ShoppingCart,
  Zap, Flame, Droplets, HardHat, Settings2, ChevronRight, ChevronLeft,
  Stethoscope, Pill, Map, Trees,
} from "lucide-react";
import { Professional, Comercio, TurnoResponse, Supermarket, ComercioPost } from "../types";
import ComercioPostCard from "../components/ComercioPostCard";
import Navbar from "../components/Navbar";
import { useTheme } from "../contexts/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function photoUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.startsWith("/uploads/") ? `${API_URL}${url}` : url;
}

interface Props {
  professionals: Professional[];
  comercios: Comercio[];
  turno: TurnoResponse | null;
  supermarkets: Supermarket[];
}

const SECTION_BANNERS = [
  {
    label: "Oficios",
    sub: "Plomeros, electricistas y más",
    href: "/oficios",
    Icon: Wrench,
    gradient: "from-blue-600 to-indigo-700",
    glow: "shadow-blue-500/30",
  },
  {
    label: "Comercios",
    sub: "Catálogos y ofertas locales",
    href: "/comercios",
    Icon: Store,
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/30",
  },
  {
    label: "Médicos",
    sub: "IAPOS, PAMI y más",
    href: "/medicos",
    Icon: Stethoscope,
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/30",
  },
  {
    label: "Ofertas",
    sub: "Supermercados de Reconquista",
    href: "/ofertas",
    Icon: ShoppingCart,
    gradient: "from-yellow-400 to-orange-500",
    glow: "shadow-yellow-500/30",
  },
  {
    label: "Farmacias",
    sub: "Turno de hoy",
    href: "/app?view=farmacias",
    Icon: Pill,
    gradient: "from-green-500 to-emerald-600",
    glow: "shadow-green-500/30",
  },
  {
    label: "Mapa",
    sub: "Reportes en tiempo real",
    href: "/app",
    Icon: Map,
    gradient: "from-slate-500 to-gray-700",
    glow: "shadow-slate-500/30",
  },
] as const;

const HOGAR_CATS = [
  { label: "Gasistas",      Icon: Flame,     image: "/banners/gasistas.webp",  tag: "gasista"      },
  { label: "Electricistas", Icon: Zap,       image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=200&fit=crop&q=80", tag: "electricista" },
  { label: "Plomeros",      Icon: Droplets,  image: "/banners/plomeros.webp",  tag: "plomero"      },
  { label: "Albañiles",     Icon: HardHat,   image: "/banners/albanil.webp",   tag: "albañil" },
  { label: "Carpinteros",   Icon: Trees,     image: "/banners/carpintero.webp",tag: "carpintero"   },
  { label: "Mecánicos",     Icon: Settings2, image: "/banners/mecanicos.webp", tag: "mecánico"},
] as const;

const PRO_GRADIENTS = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-indigo-500 to-indigo-700",
  "from-cyan-500 to-cyan-700",
  "from-violet-500 to-violet-700",
] as const;

const COMERCIO_BG_GRADIENTS = [
  "from-purple-900 via-purple-800 to-indigo-900",
  "from-blue-900 via-blue-800 to-cyan-900",
  "from-violet-900 via-violet-800 to-purple-800",
  "from-indigo-900 via-indigo-800 to-blue-900",
  "from-slate-800 via-slate-700 to-indigo-900",
] as const;

const slideVariants = {
  enter: () => ({ scale: 0.92, opacity: 0, filter: "blur(4px)" }),
  center: { scale: 1, opacity: 1, filter: "blur(0px)" },
  exit: () => ({ scale: 1.06, opacity: 0, filter: "blur(2px)" }),
};
interface PromoSlide {
  type: "promo";
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  gradient: string;
  accent: string;
}

type SlideItem<T> = { type: "profile"; data: T } | PromoSlide;

const PRO_PROMOS: PromoSlide[] = [
  {
    type: "promo" as const,
    id: "pro-cta",
    tag: "OFRECÉ TUS SERVICIOS",
    title: "Tu oficio tiene valor. Hacelo visible.",
    subtitle: "Creá tu perfil gratis y llegá a cientos de vecinos de Reconquista que buscan tu trabajo.",
    cta: "Crear mi perfil",
    href: "/profesional/nuevo",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop&q=80",
    gradient: "from-slate-950/98 via-slate-950/85 to-slate-900/50",
    accent: "bg-white text-gray-900",
  },
  {
    type: "promo" as const,
    id: "pro-ranking",
    tag: "SISTEMA DE RANKING",
    title: "Los mejores aparecen primero.",
    subtitle: "Calificaciones de vecinos + recomendaciones = más visibilidad en Destacados.",
    cta: "Ver profesionales",
    href: "/oficios",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop&q=80",
    gradient: "from-amber-950/98 via-amber-950/85 to-amber-900/50",
    accent: "bg-amber-400 text-gray-900",
  },
];

const COM_PROMOS: PromoSlide[] = [
  {
    type: "promo" as const,
    id: "com-founder",
    tag: "INSIGNIA FOUNDER",
    title: "Sé de los primeros. Para siempre.",
    subtitle: "La insignia Founder es permanente y da máxima visibilidad a tu comercio en toda la app.",
    cta: "Registrar mi comercio",
    href: "/comercio/nuevo",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&q=80",
    gradient: "from-blue-950/98 via-blue-950/85 to-blue-900/50",
    accent: "bg-white text-gray-900",
  },
  {
    type: "promo" as const,
    id: "com-cta",
    tag: "COMERCIOS LOCALES",
    title: "Tus clientes te buscan acá.",
    subtitle: "Mostrá tus productos, ofertas y contacto directo por WhatsApp. Simple y gratis.",
    cta: "Crear mi perfil",
    href: "/comercio/nuevo",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop&q=80",
    gradient: "from-violet-950/98 via-violet-950/85 to-violet-900/50",
    accent: "bg-purple-400 text-white",
  },
];

function buildMixed<T>(items: T[], promos: PromoSlide[], every: number): SlideItem<T>[] {
  const result: SlideItem<T>[] = [];
  let pi = 0;
  items.forEach((item, i) => {
    result.push({ type: "profile" as const, data: item });
    if ((i + 1) % every === 0 && pi < promos.length) result.push(promos[pi++]);
  });
  while (pi < promos.length) result.push(promos[pi++]);
  return result;
}


// ── Weather ────────────────────────────────────────────────────────────────
type WeatherCondition = "sunny" | "partly-cloudy" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy" | "night";
interface WeatherData { temp: number; condition: WeatherCondition; }

const WEATHER_CFG: Record<WeatherCondition, { icon: string; gradient: string }> = {
  sunny:          { icon: "☀️",  gradient: "linear-gradient(180deg,#0369a1 0%,#0284c7 45%,#38bdf8 100%)" },
  "partly-cloudy":{ icon: "⛅",  gradient: "linear-gradient(180deg,#374151 0%,#4b5563 50%,#6b7280 100%)" },
  cloudy:         { icon: "☁️",  gradient: "linear-gradient(180deg,#374151 0%,#6b7280 100%)" },
  rainy:          { icon: "🌧️", gradient: "linear-gradient(180deg,#1e293b 0%,#334155 50%,#475569 100%)" },
  stormy:         { icon: "⛈️", gradient: "linear-gradient(180deg,#0f172a 0%,#1e293b 60%,#334155 100%)" },
  snowy:          { icon: "❄️",  gradient: "linear-gradient(180deg,#7dd3fc 0%,#bae6fd 50%,#e0f2fe 100%)" },
  foggy:          { icon: "🌫️", gradient: "linear-gradient(180deg,#64748b 0%,#94a3b8 100%)" },
  night:          { icon: "🌙",  gradient: "linear-gradient(180deg,#0f172a 0%,#1e1b4b 50%,#1e3a5f 100%)" },
};

function codeToCondition(code: number): WeatherCondition {
  const h = new Date().getHours();
  if (h >= 20 || h < 6) return "night";
  if (code === 0)                               return "sunny";
  if (code <= 2)                                return "partly-cloudy";
  if (code === 3)                               return "cloudy";
  if (code <= 48)                               return "foggy";
  if (code <= 67 || (code >= 80 && code <= 82)) return "rainy";
  if (code <= 77 || code === 85 || code === 86) return "snowy";
  return "stormy";
}

function WeatherAnimation({ c }: { c: WeatherCondition }) {
  if (c === "rainy" || c === "stormy") return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`@keyframes rr-rain{0%{transform:translateY(-20px) rotate(12deg);opacity:.55}100%{transform:translateY(340px) rotate(12deg);opacity:0}}`}</style>
      {Array.from({length:22},(_,i)=>(
        <div key={i} style={{position:"absolute",top:0,left:`${(i*4.6)%100}%`,width:"1.5px",height:`${10+(i*5)%16}px`,background:"rgba(255,255,255,.28)",borderRadius:"2px",animation:`rr-rain ${.5+(i*.04)%.4}s linear ${(i*.07)%1.2}s infinite`}}/>
      ))}
      {c==="stormy"&&<><style>{`@keyframes rr-flash{0%,94%,96%,100%{opacity:0}95%{opacity:1}}`}</style><div style={{position:"absolute",inset:0,background:"rgba(255,255,220,.04)",animation:"rr-flash 5s ease-in-out infinite"}}/></>}
    </div>
  );
  if (c === "sunny") return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`
        @keyframes rr-sun-pulse{0%,100%{transform:scale(1);opacity:.95}50%{transform:scale(1.06);opacity:1}}
        @keyframes rr-rays{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes rr-halo{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.55;transform:scale(1.12)}}
      `}</style>
      {/* Halo exterior */}
      <div style={{position:"absolute",top:"-60px",right:"-60px",width:"280px",height:"280px",borderRadius:"50%",background:"radial-gradient(circle,rgba(251,191,36,.45) 0%,rgba(251,191,36,.15) 45%,transparent 70%)",animation:"rr-halo 3.5s ease-in-out infinite"}}/>
      {/* Disco solar */}
      <div style={{position:"absolute",top:"2px",right:"2px",width:"110px",height:"110px",borderRadius:"50%",background:"radial-gradient(circle,rgba(255,230,100,1) 0%,rgba(251,191,36,.95) 60%,rgba(251,146,36,.7) 100%)",boxShadow:"0 0 40px rgba(251,191,36,.6),0 0 80px rgba(251,191,36,.25)",animation:"rr-sun-pulse 3s ease-in-out infinite"}}/>
    </div>
  );
  if (c === "partly-cloudy" || c === "cloudy") return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`@keyframes rr-cloud{0%,100%{transform:translateX(-8px)}50%{transform:translateX(8px)}}`}</style>
      {[{w:130,h:55,top:"18%",left:"5%",d:"0s",o:.13},{w:170,h:65,top:"35%",left:"48%",d:"1.8s",o:.09},{w:95,h:42,top:"8%",left:"62%",d:".8s",o:.11}].map((cl,i)=>(
        <div key={i} style={{position:"absolute",top:cl.top,left:cl.left,width:cl.w,height:cl.h,borderRadius:"50%",background:`rgba(255,255,255,${cl.o})`,filter:"blur(22px)",animation:`rr-cloud ${5+i*1.5}s ease-in-out ${cl.d} infinite`}}/>
      ))}
    </div>
  );
  if (c === "night") return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`@keyframes rr-twinkle{0%,100%{opacity:.15}50%{opacity:.9}}`}</style>
      {Array.from({length:28},(_,i)=>(
        <div key={i} style={{position:"absolute",top:`${(i*3.4)%88}%`,left:`${(i*7.3)%96}%`,width:`${i%3===0?2:1.5}px`,height:`${i%3===0?2:1.5}px`,borderRadius:"50%",background:"rgba(255,255,255,.9)",animation:`rr-twinkle ${1.5+(i*.1)%1.5}s ease-in-out ${(i*.18)%2.5}s infinite`}}/>
      ))}
    </div>
  );
  if (c === "snowy") return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`@keyframes rr-snow{0%{transform:translateY(-10px) translateX(0);opacity:.8}100%{transform:translateY(340px) translateX(18px);opacity:0}}`}</style>
      {Array.from({length:18},(_,i)=>(
        <div key={i} style={{position:"absolute",top:0,left:`${(i*5.4)%100}%`,width:`${3+(i*2)%4}px`,height:`${3+(i*2)%4}px`,borderRadius:"50%",background:"rgba(255,255,255,.75)",animation:`rr-snow ${2+(i*.14)%2}s linear ${(i*.12)%2}s infinite`}}/>
      ))}
    </div>
  );
  return null;
}

export default function HomeClient({ professionals, comercios, turno, supermarkets }: Props) {
  const router = useRouter();
  const { user } = useUser();
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");

  const bg          = isDark ? "bg-gray-950"  : "bg-gray-50";
  const textPrimary = isDark ? "text-white"   : "text-gray-900";
  const textSec     = isDark ? "text-gray-400": "text-gray-500";
  const textMuted   = isDark ? "text-gray-500": "text-gray-400";
  const cardBg      = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  const greeting = user?.firstName ? `¡Hola, ${user.firstName}!` : "¡Hola, Bienvenido!";

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recentProductos, setRecentProductos] = useState<{ id: string; nombre: string; tipo: string; precio?: string; foto?: string; comercio: { nombre: string; slug: string; logo?: string; foto?: string } }[]>([]);
  const [recentPosts, setRecentPosts] = useState<ComercioPost[]>([]);
  const [proSlide, setProSlide] = useState(0);
  const [proDir, setProDir] = useState(1);
  const [comercioSlide, setComercioSlide] = useState(0);
  const [comercioDir, setComercioDir] = useState(1);
  const proSwipeX = useRef(0);
  const comSwipeX = useRef(0);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=-29.15&longitude=-59.64&current=temperature_2m,weather_code&timezone=America/Argentina/Buenos_Aires")
      .then(r => r.json())
      .then(d => setWeather({ temp: Math.round(d.current.temperature_2m), condition: codeToCondition(d.current.weather_code) }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/productos/recientes?limit=16`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setRecentProductos(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/posts/recientes?limit=10`)
      .then(r => r.json())
      .then(data => Array.isArray(data) && setRecentPosts(data))
      .catch(() => {});
  }, []);

  const disponibles = professionals.filter((p) => p.disponible);
  const proItems = disponibles.slice(0, 8);
  const proSlides = buildMixed(proItems, PRO_PROMOS, 3);

  const featuredComercios = comercios.filter(
    (c) => c.activo && (c.isPremium || c.isFounder)
  );
  const comSlides = buildMixed(featuredComercios, COM_PROMOS, 2);

  useEffect(() => {
    if (proSlides.length <= 1) return;
    const t = setInterval(() => {
      setProDir(1);
      setProSlide(p => (p + 1) % proSlides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [proSlides.length]);

  useEffect(() => {
    if (comSlides.length <= 1) return;
    const t = setInterval(() => {
      setComercioDir(1);
      setComercioSlide(p => (p + 1) % comSlides.length);
    }, 6000);
    return () => clearInterval(t);
  }, [comSlides.length]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <Navbar sidebarDisabled />

      {/* ── 1+2. Weather Hero ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden w-full"
          style={{
            background: weather
              ? WEATHER_CFG[weather.condition].gradient
              : "linear-gradient(180deg,#1e3a8a 0%,#1e40af 100%)",
            minHeight: "280px",
            paddingTop: "80px",
          }}
        >
          {/* Animación climática */}
          <WeatherAnimation c={weather?.condition ?? "cloudy"} />

          {/* Contenido encima de la animación */}
          <div className="relative z-10 max-w-xl md:max-w-3xl mx-auto px-4 md:px-8 flex flex-col items-center justify-center gap-4 py-10 md:py-14 text-center">

            {/* Location + weather badge */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="flex items-center gap-1.5 text-white/70 text-xs">
                <MapPin className="w-3 h-3" />
                <span>Reconquista, Santa Fe</span>
              </div>
              {weather && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold">
                  <span>{WEATHER_CFG[weather.condition].icon}</span>
                  <span>{weather.temp}°C</span>
                </div>
              )}
            </div>

            {/* Greeting */}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-md">{greeting}</h1>
              <p className="text-white/70 text-sm mt-1">¿Qué necesitás hoy?</p>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative w-full md:max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={() => { if (!query) router.push('/buscar'); }}
                placeholder="Buscar plomero, electricista, médico..."
                className="w-full pl-11 pr-11 py-3.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/90 text-gray-900 placeholder-gray-400 shadow-lg border-0"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </motion.div>

      <div className="max-w-xl md:max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-32">

        {/* ── 3. Banners de secciones ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide md:overflow-visible"
        >
          <div className="flex gap-3 pb-1 md:flex-wrap" style={{ width: "max-content" }}>
            {SECTION_BANNERS.map(({ label, sub, href, Icon, gradient, glow }) => (
              <Link
                key={label}
                href={href}
                className={`flex-shrink-0 w-40 h-[108px] rounded-2xl bg-gradient-to-br ${gradient} shadow-lg ${glow} flex flex-col justify-between p-4 transition-transform active:scale-[0.97] hover:scale-[1.02]`}
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm leading-tight">{label}</p>
                  <p className="text-white/70 text-[10px] mt-0.5 leading-snug">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* WhatsApp Orders Feature Banner */}
        <section className="px-0 mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5">
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-base leading-tight">Pedi en tus locales favoritos</p>
                <p className="text-amber-100 text-xs mt-0.5 leading-snug">Arma tu pedido y mandalo directo al WhatsApp del comercio</p>
              </div>
              <Link href="/comercios" className="flex-shrink-0 px-3 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition-colors">
                Ver comercios
              </Link>
            </div>
          </div>
        </section>

        {/* ── Comunidad ─────────────────────────────────────────────────── */}
        {recentPosts.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between px-0 mb-3">
              <div>
                <p className={`font-black text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                  En la comunidad
                </p>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Lo ultimo de los comercios locales
                </p>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
              {recentPosts.map(post => (
                <ComercioPostCard
                  key={post.id}
                  post={post}
                  variant="slide"
                  isDark={isDark}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── 4. Novedades — productos recientes + promo comercios ───────── */}
        {recentProductos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
            className="mb-8"
          >
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Novedades
            </p>
            <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>

                {/* Banner "Sumá tu comercio" — siempre primero */}
                <Link
                  href="/para-comercios"
                  className="flex-shrink-0 w-44 rounded-2xl overflow-hidden relative shadow-lg"
                  style={{ height: 180 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600" />
                  <div className="absolute inset-0 flex flex-col justify-between p-4">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-black text-sm leading-tight">¿Tenés un comercio?</p>
                      <p className="text-white/80 text-[10px] mt-1 leading-snug">Mostralo en Reconquista. Gratis.</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-white/20 px-2 py-1 rounded-full">
                        Registrate →
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Productos reales */}
                {recentProductos.map((p) => {
                  const foto = p.foto ? (p.foto.startsWith("/uploads/") ? `${API_URL}${p.foto}` : p.foto) : null;
                  const logo = (p.comercio.logo || p.comercio.foto)
                    ? ((p.comercio.logo || p.comercio.foto)!.startsWith("/uploads/") ? `${API_URL}${p.comercio.logo || p.comercio.foto}` : (p.comercio.logo || p.comercio.foto))
                    : null;
                  return (
                    <Link
                      key={p.id}
                      href={`/comercio/${p.comercio.slug}`}
                      className={`flex-shrink-0 w-36 rounded-2xl border overflow-hidden flex flex-col transition-transform active:scale-[0.97] hover:scale-[1.02] ${cardBg}`}
                      style={{ height: 180 }}
                    >
                      <div className={`w-full flex-1 flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                        {foto
                          ? <img src={foto} alt={p.nombre} className="w-full h-full object-cover" />
                          : <ShoppingCart className={`w-7 h-7 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                        }
                      </div>
                      <div className="p-2.5 flex-shrink-0">
                        <p className={`text-[11px] font-bold line-clamp-2 leading-snug ${isDark ? "text-white" : "text-gray-900"}`}>{p.nombre}</p>
                        {p.precio && <p className="text-[11px] font-black text-green-500 mt-0.5">{p.precio}</p>}
                        <div className="flex items-center gap-1 mt-1.5">
                          {logo
                            ? <img src={logo} alt="" className="w-3.5 h-3.5 rounded-full object-cover flex-shrink-0" />
                            : <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center text-[7px] font-black ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>{p.comercio.nombre[0]}</div>
                          }
                          <p className={`text-[9px] truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>{p.comercio.nombre}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}

              </div>
            </div>
          </motion.div>
        )}

        {/* ── 4. Farmacia de turno ──────────────────────────────────────── */}
        {turno && turno.farmacias.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
            className="mb-8"
          >
            <div className={`rounded-2xl border p-4 ${isDark ? "bg-green-950/40 border-green-900" : "bg-green-50 border-green-200"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center">
                    <Pill className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-600">Farmacia de turno</p>
                    <p className={`text-xs ${textMuted}`}>{turno.fecha}</p>
                  </div>
                </div>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:flex-wrap gap-2">
                {turno.farmacias.slice(0, 3).map((farmacia) => (
                  <div
                    key={farmacia.id}
                    className={`rounded-xl p-3 border md:flex-1 md:min-w-[280px] ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
                  >
                    <p className={`text-sm font-semibold ${textPrimary}`}>{farmacia.nombre}</p>
                    <div className={`flex items-center gap-1 mt-0.5 ${textMuted}`}>
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="text-xs">{farmacia.direccion}</span>
                    </div>
                    {farmacia.telefono && (
                      <a
                        href={`tel:${farmacia.telefono}`}
                        className="inline-flex items-center gap-1 mt-1.5 text-xs text-green-600 font-medium"
                      >
                        <Phone className="w-3 h-3" />
                        {farmacia.telefono}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 5. Profesionales Destacados ──────────────────────────────── */}
        {proSlides.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`text-base font-bold ${textPrimary}`}>Profesionales Destacados</p>
              <Link href="/oficios" className={`text-xs flex items-center gap-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                Ver todos <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div
              className="relative rounded-2xl overflow-hidden h-44 md:h-52 touch-pan-y"
              onPointerDown={(e) => { proSwipeX.current = e.clientX; }}
              onPointerUp={(e) => {
                const d = proSwipeX.current - e.clientX;
                if (d > 50) { setProDir(1); setProSlide(p => (p + 1) % proSlides.length); }
                else if (d < -50) { setProDir(-1); setProSlide(p => (p - 1 + proSlides.length) % proSlides.length); }
              }}
            >
              <AnimatePresence mode="wait" custom={proDir}>
                {(() => {
                  const item = proSlides[proSlide];
                  if (!item) return null;
                  if (item.type === "promo") return (
                    <motion.div key={item.id} custom={proDir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
                      <div className="h-full relative overflow-hidden">
                        <img src={item.image} alt="" className="absolute inset-0 w-full h-full object-cover object-right" />
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
                  const photo = photoUrl(pro.foto);
                  const gradient = PRO_GRADIENTS[proSlide % PRO_GRADIENTS.length];
                  return (
                    <motion.div
                      key={pro.id}
                      custom={proDir}
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
                            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-white/20 shadow-xl">
                              {photo ? (
                                <img src={photo} alt={pro.nombre} className="w-full h-full object-cover" />
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
                                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 1.99l-3.714 5.06a2 2 0 00-.373 1.169V19a2 2 0 002 2h.095c.497 0 .905-.402.905-.9V16.91c0-.333.215-.627.527-.738l2.527-.946" /></svg>
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



            </div>
          </motion.div>
        )}

        {/* ── 6. Para tu hogar ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-base font-bold ${textPrimary}`}>Para tu hogar</p>
            <Link href="/oficios" className={`text-xs flex items-center gap-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              Ver listado <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {HOGAR_CATS.map(({ label, Icon, image, tag }) => (
              <Link
                key={label}
                href={`/oficios?categoria=${tag}`}
                className="relative h-24 md:h-32 rounded-2xl overflow-hidden active:scale-[0.97] transition-all"
              >
                <img src={image} alt={label} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-white flex-shrink-0" />
                  <span className="text-sm font-bold text-white">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── 7. Comercios Destacados ───────────────────────────────────── */}
        {comSlides.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`text-base font-bold ${textPrimary}`}>Comercios Destacados</p>
              <Link href="/comercios" className={`text-xs flex items-center gap-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                Ver todos <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div
              className="relative rounded-2xl overflow-hidden h-44 md:h-52 touch-pan-y"
              onPointerDown={(e) => { comSwipeX.current = e.clientX; }}
              onPointerUp={(e) => {
                const d = comSwipeX.current - e.clientX;
                if (d > 50) { setComercioDir(1); setComercioSlide(p => (p + 1) % comSlides.length); }
                else if (d < -50) { setComercioDir(-1); setComercioSlide(p => (p - 1 + comSlides.length) % comSlides.length); }
              }}
            >
              <AnimatePresence mode="wait" custom={comercioDir}>
                {(() => {
                  const item = comSlides[comercioSlide];
                  if (!item) return null;
                  if (item.type === "promo") return (
                    <motion.div key={item.id} custom={comercioDir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
                      <div className="h-full relative overflow-hidden">
                        <img src={item.image} alt="" className="absolute inset-0 w-full h-full object-cover object-right" />
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
                  const logo = photoUrl(comercio.logo || comercio.foto);
                  const bgGrad = COMERCIO_BG_GRADIENTS[comercioSlide % COMERCIO_BG_GRADIENTS.length];
                  return (
                    <motion.div
                      key={comercio.id}
                      custom={comercioDir}
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
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-white shadow-xl flex items-center justify-center">
                              {logo ? (
                                <img src={logo} alt={comercio.nombre} className="w-full h-full object-cover" />
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
                              <p className="text-purple-300 text-sm mt-0.5">{comercio.rubro}</p>
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                              {comercio.isFounder && <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-500/25 text-blue-300 border border-blue-500/30">FOUNDER</span>}
                              {!comercio.isFounder && comercio.isPremium && <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-300 border border-amber-500/30">PREMIUM</span>}
                              {(comercio.ratingAvg ?? 0) > 0 && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-yellow-400/20 text-yellow-300 flex items-center gap-1 border border-yellow-400/20">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                  {(comercio.ratingAvg ?? 0).toFixed(1)}
                                </span>
                              )}
                              {(comercio.recommendations ?? 0) > 0 && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 1.99l-3.714 5.06a2 2 0 00-.373 1.169V19a2 2 0 002 2h.095c.497 0 .905-.402.905-.9V16.91c0-.333.215-.627.527-.738l2.527-.946" /></svg>
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



            </div>
          </motion.div>
        )}

        {/* ── 8. Supermercados ─────────────────────────────────────────── */}
        {supermarkets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`text-base font-bold ${textPrimary}`}>Ofertas de supermercados</p>
              <Link href="/ofertas" className={`text-xs flex items-center gap-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                Ver todas <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {/* Mobile: scroll horizontal */}
            <div className="md:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>
                {supermarkets.slice(0, 8).map((s) => (
                  <Link
                    key={s.id}
                    href={`/ofertas/${s.id}`}
                    className={`w-36 flex-shrink-0 p-3 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all active:scale-[0.97] ${cardBg} ${isDark ? "hover:border-gray-700" : "hover:border-gray-300"}`}
                  >
                    {s.logo ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center">
                        <img src={s.logo} alt={s.name} className="w-14 h-14 object-contain" />
                      </div>
                    ) : (
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                        {s.name[0].toUpperCase()}
                      </div>
                    )}
                    <p className={`text-xs font-semibold truncate w-full ${textPrimary}`}>{s.name}</p>
                    {s.offerCount && s.offerCount > 0 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                        {s.offerCount} ofertas
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
            {/* Desktop: grid */}
            <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-3">
              {supermarkets.slice(0, 10).map((s) => (
                <Link
                  key={s.id}
                  href={`/ofertas/${s.id}`}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all active:scale-[0.97] ${cardBg} ${isDark ? "hover:border-gray-700" : "hover:border-gray-300"}`}
                >
                  {s.logo ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center">
                      <img src={s.logo} alt={s.name} className="w-14 h-14 object-contain" />
                    </div>
                  ) : (
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                      {s.name[0].toUpperCase()}
                    </div>
                  )}
                  <p className={`text-xs font-semibold truncate w-full ${textPrimary}`}>{s.name}</p>
                  {s.offerCount && s.offerCount > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                      {s.offerCount} ofertas
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
