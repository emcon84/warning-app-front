"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Search, X, MapPin, Star, Phone, Wrench, Store, ShoppingCart,
  Zap, Flame, Droplets, HardHat, Settings2, ChevronRight,
  Stethoscope, Pill, Map, Trees,
} from "lucide-react";
import { Professional, Comercio, TurnoResponse, Supermarket } from "../types";
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

const QUICK_ACCESS = [
  { label: "Oficios",    href: "/oficios", Icon: Wrench,       color: "bg-blue-500/15 text-blue-500"   },
  { label: "Médicos",    href: "/medicos",        Icon: Stethoscope,  color: "bg-red-500/15 text-red-500"     },
  { label: "Farmacias",  href: "/app?view=farmacias", Icon: Pill,      color: "bg-green-500/15 text-green-500" },
  { label: "Comercios",  href: "/comercios",      Icon: Store,        color: "bg-purple-500/15 text-purple-500"},
  { label: "Ofertas",    href: "/ofertas",         Icon: ShoppingCart, color: "bg-amber-500/15 text-amber-500" },
  { label: "Mapa",       href: "/app",            Icon: Map,          color: "bg-sky-500/15 text-sky-500"     },
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

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=-29.15&longitude=-59.64&current=temperature_2m,weather_code&timezone=America/Argentina/Buenos_Aires")
      .then(r => r.json())
      .then(d => setWeather({
        temp: Math.round(d.current.temperature_2m),
        condition: codeToCondition(d.current.weather_code),
      }))
      .catch(() => {});
  }, []);

  const disponibles = professionals.filter((p) => p.disponible);

  const featuredComercios = comercios.filter(
    (c) => c.activo && (c.isPremium || c.isFounder)
  );

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

        {/* ── 3. Accesos rápidos ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {QUICK_ACCESS.map(({ label, href, Icon, color }) => (
              <Link
                key={label}
                href={href}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all active:scale-[0.97] ${cardBg} ${isDark ? "hover:border-gray-700" : "hover:border-gray-300"}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold ${textPrimary}`}>{label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

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
        {disponibles.length > 0 && (
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
            {/* Mobile: scroll horizontal */}
            <div className="md:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>
                {disponibles.slice(0, 10).map((pro, index) => {
                  const photo = photoUrl(pro.foto);
                  const gradient = PRO_GRADIENTS[index % PRO_GRADIENTS.length];
                  return (
                    <Link
                      key={pro.id}
                      href={`/profesional/${pro.slug}`}
                      className={`w-44 flex-shrink-0 rounded-2xl border overflow-hidden transition-all active:scale-[0.97] ${cardBg}`}
                    >
                      <div className={`h-24 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
                        <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/30">
                          {photo ? (
                            <img src={photo} alt={pro.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white bg-white/10">
                              {pro.nombre[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-2.5">
                        <p className={`text-sm font-bold truncate ${textPrimary}`}>
                          {pro.nombre} {pro.apellido}
                        </p>
                        <p className={`text-xs capitalize truncate mt-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                          {pro.oficios[0]}
                        </p>
                        {pro.ratingCount > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-yellow-400">{pro.ratingAvg.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            {/* Desktop: grid */}
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {disponibles.slice(0, 8).map((pro, index) => {
                const photo = photoUrl(pro.foto);
                const gradient = PRO_GRADIENTS[index % PRO_GRADIENTS.length];
                return (
                  <Link
                    key={pro.id}
                    href={`/profesional/${pro.slug}`}
                    className={`rounded-2xl border overflow-hidden transition-all active:scale-[0.97] ${cardBg}`}
                  >
                    <div className={`h-24 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
                      <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/30">
                        {photo ? (
                          <img src={photo} alt={pro.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white bg-white/10">
                            {pro.nombre[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className={`text-sm font-bold truncate ${textPrimary}`}>
                        {pro.nombre} {pro.apellido}
                      </p>
                      <p className={`text-xs capitalize truncate mt-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                        {pro.oficios[0]}
                      </p>
                      {pro.ratingCount > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-yellow-400">{pro.ratingAvg.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
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
        {featuredComercios.length > 0 && (
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
            {/* Mobile: scroll horizontal */}
            <div className="md:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>
                {featuredComercios.map((comercio) => {
                  const logo = photoUrl(comercio.logo || comercio.foto);
                  return (
                    <Link
                      key={comercio.id}
                      href={`/comercio/${comercio.slug}`}
                      className={`w-40 flex-shrink-0 p-3 rounded-2xl border flex flex-col gap-2 transition-all active:scale-[0.97] ${cardBg} ${isDark ? "hover:border-gray-700" : "hover:border-gray-300"}`}
                    >
                      <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                        {logo ? (
                          <img src={logo} alt={comercio.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${textMuted}`}>
                            {comercio.nombre[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-bold truncate ${textPrimary}`}>{comercio.nombre}</p>
                        <p className={`text-xs truncate ${isDark ? "text-purple-400" : "text-purple-600"}`}>{comercio.rubro}</p>
                        <div className="mt-1.5">
                          {comercio.isFounder && (
                            <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-500">
                              FOUNDER
                            </span>
                          )}
                          {!comercio.isFounder && comercio.isPremium && (
                            <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500">
                              PREMIUM
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            {/* Desktop: grid */}
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {featuredComercios.map((comercio) => {
                const logo = photoUrl(comercio.logo || comercio.foto);
                return (
                  <Link
                    key={comercio.id}
                    href={`/comercio/${comercio.slug}`}
                    className={`p-3 rounded-2xl border flex flex-col gap-2 transition-all active:scale-[0.97] ${cardBg} ${isDark ? "hover:border-gray-700" : "hover:border-gray-300"}`}
                  >
                    <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                      {logo ? (
                        <img src={logo} alt={comercio.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${textMuted}`}>
                          {comercio.nombre[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-bold truncate ${textPrimary}`}>{comercio.nombre}</p>
                      <p className={`text-xs truncate ${isDark ? "text-purple-400" : "text-purple-600"}`}>{comercio.rubro}</p>
                      <div className="mt-1.5">
                        {comercio.isFounder && (
                          <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-500">
                            FOUNDER
                          </span>
                        )}
                        {!comercio.isFounder && comercio.isPremium && (
                          <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500">
                            PREMIUM
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
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
