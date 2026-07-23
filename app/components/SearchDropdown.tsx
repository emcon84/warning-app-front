"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, ChevronRight, Star, Package, ShoppingBag, Stethoscope, Store, User } from "lucide-react";
import { API_URL } from "@/lib/api/client";
import { resolvePhotoUrl } from "@/lib/utils/photo";

// ── Types ────────────────────────────────────────────────────────────────────

interface SearchProfessional {
  id: string; nombre: string; apellido: string; slug: string;
  oficios: string[]; barrio: string; foto: string | null;
  ratingAvg: number; ratingCount: number; type: "professional";
}

interface SearchComercio {
  id: string; nombre: string; slug: string; rubro: string; barrio: string;
  logo: string | null; isPremium: boolean; isFounder: boolean; type: "comercio";
}

interface SearchDoctor {
  id: string; nombre: string; especialidad: string; barrio: string;
  obrasSociales: string[]; type: "doctor";
}

interface SearchProduct {
  id: string; nombre: string; tipo: string; precio: number | null;
  foto: string | null; comercioSlug: string; comercioNombre: string;
  comercioLogo: string | null; type: "product";
}

interface SearchResults {
  professionals: SearchProfessional[];
  comercios: SearchComercio[];
  doctors: SearchDoctor[];
  products: SearchProduct[];
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  query: string;
  isDark: boolean;
  visible: boolean;
  onClose: () => void;
  onClear: () => void;
}

// ── Category config ──────────────────────────────────────────────────────────

const CATEGORIES: { key: keyof SearchResults; label: string; icon: React.ReactNode; href: (item: any) => string }[] = [
  {
    key: "professionals",
    label: "Profesionales",
    icon: <User className="w-3.5 h-3.5" />,
    href: (p: SearchProfessional) => `/profesional/${p.slug}`,
  },
  {
    key: "comercios",
    label: "Comercios",
    icon: <Store className="w-3.5 h-3.5" />,
    href: (c: SearchComercio) => `/comercio/${c.slug}`,
  },
  {
    key: "products",
    label: "Productos",
    icon: <Package className="w-3.5 h-3.5" />,
    href: (p: SearchProduct) => `/comercio/${p.comercioSlug}`,
  },
  {
    key: "doctors",
    label: "Médicos",
    icon: <Stethoscope className="w-3.5 h-3.5" />,
    href: (d: SearchDoctor) => `/medicos`,
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export function SearchDropdown({ query, isDark, visible, onClose, onClear }: Props) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<SearchResults>({ professionals: [], comercios: [], doctors: [], products: [] });
  const [loading, setLoading] = useState(false);

  const bg      = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const itemHov = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";
  const textMut = isDark ? "text-gray-500" : "text-gray-400";
  const catBg   = isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600";

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ professionals: [], comercios: [], doctors: [], products: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
      } catch {} finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside → close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (visible) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [visible, onClose]);

  // Escape → close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (visible) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, onClose]);

  const total = results.professionals.length + results.comercios.length + results.doctors.length + results.products.length;

  if (!visible || (!loading && total === 0 && query.length < 2)) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute left-0 right-0 top-full mt-1 rounded-2xl border shadow-2xl overflow-hidden z-[1003] ${bg}`}
      style={{ maxHeight: "70vh", overflowY: "auto" }}
    >
      {/* Loading state */}
      {loading && (
        <div className="p-4">
          <div className="flex items-center gap-3 text-sm">
            <Search className={`w-4 h-4 ${textMut} animate-pulse`} />
            <span className={textMut}>Buscando...</span>
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && total === 0 && query.length >= 2 && (
        <div className="p-6 text-center">
          <p className={`text-sm ${textPri}`}>No hay resultados para &ldquo;{query}&rdquo;</p>
          <p className={`text-xs mt-1 ${textMut}`}>Probá con otras palabras</p>
        </div>
      )}

      {/* Results */}
      {!loading && CATEGORIES.map((cat) => {
        const items = results[cat.key];
        if (items.length === 0) return null;

        return (
          <div key={cat.key}>
            <div className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider ${catBg}`}>
              {cat.icon}
              {cat.label}
            </div>

            {items.map((item: any, i: number) => (
              <button
                key={`${cat.key}-${i}`}
                onClick={() => {
                  router.push(cat.href(item));
                  onClose();
                  onClear();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${itemHov}`}
              >
                {/* Thumbnail */}
                <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                  {item.foto || item.logo ? (
                    <Image
                      src={resolvePhotoUrl(item.foto || item.logo)}
                      alt=""
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : item.type === "product" ? (
                    <ShoppingBag className={`w-4 h-4 ${textMut}`} />
                  ) : item.type === "doctor" ? (
                    <Stethoscope className={`w-4 h-4 ${textMut}`} />
                  ) : (
                    <span className={`text-sm font-bold ${textMut}`}>{(item.nombre || "")[0]}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${textPri}`}>
                      {item.type === "professional" ? `${item.nombre} ${item.apellido ?? ""}` : item.nombre}
                    </span>
                    {item.type === "comercio" && item.isFounder && (
                      <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-amber-900/40 text-amber-400 border border-amber-800/50">F</span>
                    )}
                    {item.type === "comercio" && item.isPremium && !item.isFounder && (
                      <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-indigo-900/40 text-indigo-400 border border-indigo-800/50">P</span>
                    )}
                  </div>
                  <div className={`text-xs mt-0.5 truncate ${textSec}`}>
                    {item.type === "professional" && `${item.oficios?.[0] ?? ""} · ${item.barrio ?? ""}`}
                    {item.type === "comercio" && `${item.rubro ?? ""} · ${item.barrio ?? ""}`}
                    {item.type === "doctor" && `${item.especialidad ?? ""} · ${item.barrio ?? ""}`}
                    {item.type === "product" && `${item.tipo === "servicio" ? "Servicio" : "Producto"}${item.precio ? ` · $${item.precio}` : ""} · ${item.comercioNombre ?? ""}`}
                  </div>
                  {item.type === "professional" && item.ratingCount > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className={`text-xs ${textSec}`}>{item.ratingAvg.toFixed(1)}</span>
                    </div>
                  )}
                  {item.type === "doctor" && item.obrasSociales?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {item.obrasSociales.slice(0, 3).map((os: string) => (
                        <span key={os} className={`text-[10px] px-1.5 py-0.5 rounded-full ${catBg}`}>{os}</span>
                      ))}
                    </div>
                  )}
                </div>

                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${textMut}`} />
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
