"use client";

import { useState } from "react";
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
  { label: "Oficios",    href: "/oficios/lista", Icon: Wrench,       color: "bg-blue-500/15 text-blue-500"   },
  { label: "Médicos",    href: "/medicos",        Icon: Stethoscope,  color: "bg-red-500/15 text-red-500"     },
  { label: "Farmacias",  href: "/mas",            Icon: Pill,         color: "bg-green-500/15 text-green-500" },
  { label: "Comercios",  href: "/comercios",      Icon: Store,        color: "bg-purple-500/15 text-purple-500"},
  { label: "Ofertas",    href: "/ofertas",         Icon: ShoppingCart, color: "bg-amber-500/15 text-amber-500" },
  { label: "Mapa",       href: "/app",            Icon: Map,          color: "bg-sky-500/15 text-sky-500"     },
] as const;

const HOGAR_CATS = [
  { label: "Gasistas",      Icon: Flame,     image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=200&fit=crop&q=80" },
  { label: "Electricistas", Icon: Zap,       image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=200&fit=crop&q=80" },
  { label: "Plomeros",      Icon: Droplets,  image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=200&fit=crop&q=80" },
  { label: "Albañiles",     Icon: HardHat,   image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=200&fit=crop&q=80" },
  { label: "Carpinteros",   Icon: Trees,     image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop&q=80" },
  { label: "Mecánicos",     Icon: Settings2, image: "https://images.unsplash.com/photo-1530046339160-ce3e530d7b4e?w=400&h=200&fit=crop&q=80" },
] as const;

const PRO_GRADIENTS = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-indigo-500 to-indigo-700",
  "from-cyan-500 to-cyan-700",
  "from-violet-500 to-violet-700",
] as const;

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

  const disponibles = professionals.filter((p) => p.disponible);

  const featuredComercios = comercios.filter(
    (c) => c.activo && (c.isPremium || c.isFounder)
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/profesionales?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <Navbar sidebarDisabled />

      <div className="max-w-xl mx-auto px-4 pt-20 pb-32">

        {/* ── 1. Header con saludo ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0, ease: "easeOut" }}
          className="mb-6 text-center"
        >
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs mb-3 ${isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
            <MapPin className="w-3 h-3" />
            Reconquista, Santa Fe
          </div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>{greeting}</h1>
          <p className={`text-sm mt-1 ${textSec}`}>¿Qué necesitás hoy?</p>
        </motion.div>

        {/* ── 2. Buscador prominente ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
          className="mb-6"
        >
          <form onSubmit={handleSearch} className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar plomero, electricista, médico..."
              className={`w-full pl-11 pr-11 py-3.5 rounded-full border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-white placeholder-gray-600"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 shadow-sm"
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${textMuted} hover:text-gray-400 transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </motion.div>

        {/* ── 3. Accesos rápidos ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="grid grid-cols-3 gap-3">
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
              <div className="flex flex-col gap-2">
                {turno.farmacias.slice(0, 3).map((farmacia) => (
                  <div
                    key={farmacia.id}
                    className={`rounded-xl p-3 border ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
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
              <Link href="/oficios/lista" className={`text-xs flex items-center gap-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                Ver todos <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>
                {disponibles.map((pro, index) => {
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
            <Link href="/oficios/lista" className={`text-xs flex items-center gap-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              Ver listado <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {HOGAR_CATS.map(({ label, Icon, image }) => (
              <Link
                key={label}
                href="/oficios/lista"
                className="relative h-24 rounded-2xl overflow-hidden active:scale-[0.97] transition-all"
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
            <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>
                {featuredComercios.map((comercio) => {
                  const logo = photoUrl(comercio.logo || comercio.foto);
                  return (
                    <Link
                      key={comercio.id}
                      href={`/comercios/${comercio.slug}`}
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
            <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>
                {supermarkets.map((s) => (
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
          </motion.div>
        )}

      </div>
    </div>
  );
}
