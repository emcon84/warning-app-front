"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { Professional, Comercio, Empleado } from "../types";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Pill = "profesionales" | "comercios" | "oficios" | "empleados";

interface Props {
  professionals: Professional[];
  featured: Professional[];
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ rating, count, dark }: { rating: number; count: number; dark: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "text-yellow-400" : dark ? "text-gray-600" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {count > 0 && <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{rating.toFixed(1)} ({count})</span>}
    </div>
  );
}

function Avatar({ foto, nombre, gradient = "from-gray-600 to-gray-700" }: { foto?: string | null; nombre: string; gradient?: string }) {
  if (foto) return <img src={foto} alt={nombre} className="w-full h-full object-cover" />;
  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient} text-2xl font-bold text-white`}>
      {nombre[0].toUpperCase()}
    </div>
  );
}

function FeaturedCard({ pro, dark }: { pro: Professional; dark: boolean }) {
  return (
    <Link href={`/profesional/${pro.slug}`} className="block">
      <div className="flex flex-col items-center gap-2 cursor-pointer group w-full">
        <div className={`w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 transition-all duration-200 ${
          dark ? "ring-gray-800 group-hover:ring-gray-500" : "ring-gray-200 group-hover:ring-gray-400 shadow-md"
        }`}>
          <Avatar foto={pro.foto} nombre={pro.nombre} />
        </div>
        <div className="text-center w-full overflow-hidden">
          <p className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>{pro.nombre}</p>
          <p className={`text-[11px] capitalize truncate mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{pro.oficios[0]}</p>
          {pro.ratingCount > 0 && (
            <div className="flex items-center justify-center gap-0.5 mt-1">
              <svg className="w-3 h-3 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className={`text-[11px] font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>{pro.ratingAvg.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function FeaturedComercioCard({ comercio, dark }: { comercio: Comercio; dark: boolean }) {
  return (
    <Link href={`/comercio/${comercio.slug}`} className="block">
      <div className="flex flex-col items-center gap-2 cursor-pointer group w-full">
        <div className={`w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 transition-all duration-200 ${
          dark ? "ring-gray-800 group-hover:ring-amber-700" : "ring-gray-200 group-hover:ring-amber-400 shadow-md"
        }`}>
          <Avatar foto={comercio.foto} nombre={comercio.nombre} gradient="from-amber-700 to-amber-900" />
        </div>
        <div className="text-center w-full overflow-hidden">
          <p className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>{comercio.nombre}</p>
          <p className={`text-[11px] truncate mt-0.5 ${dark ? "text-amber-500" : "text-amber-600"}`}>{comercio.rubro}</p>
        </div>
      </div>
    </Link>
  );
}

function FeaturedEmpleadoCard({ empleado, dark }: { empleado: Empleado; dark: boolean }) {
  return (
    <Link href={`/empleado/${empleado.slug}`} className="block">
      <div className="flex flex-col items-center gap-2 cursor-pointer group w-full">
        <div className={`w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 transition-all duration-200 ${
          dark ? "ring-gray-800 group-hover:ring-blue-700" : "ring-gray-200 group-hover:ring-blue-400 shadow-md"
        }`}>
          <Avatar foto={empleado.foto} nombre={empleado.nombre} gradient="from-blue-700 to-blue-900" />
        </div>
        <div className="text-center w-full overflow-hidden">
          <p className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>{empleado.nombre}</p>
          <p className={`text-[11px] truncate mt-0.5 ${dark ? "text-blue-400" : "text-blue-600"}`}>{empleado.habilidades[0]}</p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${
            empleado.disponible
              ? dark ? "text-green-400 bg-green-900/40" : "text-green-600 bg-green-100"
              : dark ? "text-gray-500 bg-gray-800" : "text-gray-400 bg-gray-100"
          }`}>
            {empleado.disponible ? "Disponible" : "No disponible"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function InfiniteCarousel<T extends { id: string }>({
  items,
  renderCard,
}: {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  const itemSlot = 96;
  const copiesPerHalf = Math.max(3, Math.ceil(1600 / (items.length * itemSlot)));
  const totalCopies = copiesPerHalf * 2;
  const repeated = Array.from({ length: totalCopies * items.length }, (_, i) => items[i % items.length]);
  const halfWidthPx = copiesPerHalf * items.length * itemSlot;
  const duration = Math.round(halfWidthPx / 50);
  return (
    <div className="overflow-hidden -mx-4">
      <div className="flex animate-marquee" style={{ gap: "1rem", animationDuration: `${duration}s` }}>
        {repeated.map((item, i) => (
          <div key={`${item.id}-${i}`} className="flex-shrink-0 w-20">
            {renderCard(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

function OficiosCategoryGrid({
  professionals,
  dark,
  onSelect,
}: {
  professionals: Professional[];
  dark: boolean;
  onSelect: (oficio: string) => void;
}) {
  const uniqueOficios = useMemo(() => {
    const counts: Record<string, number> = {};
    professionals.forEach((p) => p.oficios.forEach((o) => { counts[o] = (counts[o] ?? 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([o]) => o);
  }, [professionals]);

  if (uniqueOficios.length === 0) {
    return (
      <div className="text-center py-8">
        <p className={`text-sm ${dark ? "text-gray-500" : "text-gray-400"}`}>Aun no hay oficios registrados.</p>
        <Link href="/profesional/nuevo" className="mt-3 text-sm text-blue-400 hover:underline">
          Registrarte como profesional
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {uniqueOficios.map((o) => (
        <button
          key={o}
          onClick={() => onSelect(o)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
            dark
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function HeartIcon({ filled, dark }: { filled: boolean; dark: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-colors ${filled ? "text-red-400" : dark ? "text-gray-600 group-hover:text-red-400" : "text-gray-300 group-hover:text-red-400"}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function ResultCard({ pro, dark, favIds, onToggleFav }: {
  pro: Professional;
  dark: boolean;
  favIds: Set<string>;
  onToggleFav: (id: string, add: boolean) => void;
}) {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const isFav = favIds.has(pro.id);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn || loading) return;
    setLoading(true);
    const wasAdding = !isFav;
    onToggleFav(pro.id, wasAdding);
    try {
      const token = await getToken();
      if (!token) { onToggleFav(pro.id, !wasAdding); return; }
      const headers: Record<string, string> = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const res = wasAdding
        ? await fetch(`${API}/api/favorites`, { method: "POST", headers, body: JSON.stringify({ professionalId: pro.id }) })
        : await fetch(`${API}/api/favorites/${pro.id}`, { method: "DELETE", headers });
      if (!res.ok) onToggleFav(pro.id, !wasAdding);
    } catch {
      onToggleFav(pro.id, !wasAdding);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Link href={`/profesional/${pro.slug}`}>
      <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
        dark ? "bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"
      }`}>
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow">
          <Avatar foto={pro.foto} nombre={pro.nombre} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>{pro.nombre} {pro.apellido}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${
              pro.disponible ? "bg-green-900/40 text-green-400 border-green-800" : dark ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-400 border-gray-200"
            }`}>{pro.disponible ? "Disponible" : "No disponible"}</span>
          </div>
          <p className={`text-sm capitalize mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>{pro.oficios.join(", ")}</p>
          <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{pro.barrio}</p>
          <div className="mt-1.5"><StarRating rating={pro.ratingAvg} count={pro.ratingCount} dark={dark} /></div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSignedIn && (
            <button onClick={toggle} disabled={loading} className="group p-1.5 rounded-full transition-colors">
              <HeartIcon filled={isFav} dark={dark} />
            </button>
          )}
          <svg className={`w-5 h-5 ${dark ? "text-gray-600" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function ComercioResultCard({ comercio, dark }: { comercio: Comercio; dark: boolean }) {
  return (
    <Link href={`/comercio/${comercio.slug}`}>
      <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
        dark ? "bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"
      }`}>
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow">
          {comercio.foto
            ? <img src={comercio.foto} alt={comercio.nombre} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-700 to-amber-900 text-2xl font-bold text-white">{comercio.nombre[0].toUpperCase()}</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>{comercio.nombre}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${dark ? "bg-amber-900/40 text-amber-400 border-amber-800" : "bg-amber-50 text-amber-600 border-amber-200"}`}>Comercio</span>
          </div>
          <p className={`text-sm mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>{comercio.rubro}</p>
          <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{comercio.barrio}</p>
        </div>
        <svg className={`w-5 h-5 flex-shrink-0 ${dark ? "text-gray-600" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function EmpleadoResultCard({ empleado, dark }: { empleado: Empleado; dark: boolean }) {
  return (
    <Link href={`/empleado/${empleado.slug}`}>
      <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
        dark ? "bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"
      }`}>
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow">
          <Avatar foto={empleado.foto} nombre={empleado.nombre} gradient="from-blue-700 to-blue-900" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>{empleado.nombre} {empleado.apellido}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${
              empleado.disponible ? "bg-green-900/40 text-green-400 border-green-800" : dark ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-400 border-gray-200"
            }`}>{empleado.disponible ? "Disponible" : "No disponible"}</span>
          </div>
          <p className={`text-sm mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>{empleado.habilidades.slice(0, 3).join(", ")}</p>
          {empleado.barrio && <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{empleado.barrio}</p>}
        </div>
        <svg className={`w-5 h-5 flex-shrink-0 ${dark ? "text-gray-600" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ProfesionalesClient({ professionals, featured }: Props) {
  const [query, setQuery] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [activePill, setActivePill] = useState<Pill>("profesionales");
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setIsDark(saved ? saved === "dark" : true);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/comercios`)
      .then((r) => r.json())
      .then((data: Comercio[]) => setComercios(data))
      .catch(() => {});
    fetch(`${API}/api/empleados`)
      .then((r) => r.json())
      .then((data: Empleado[]) => setEmpleados(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isSignedIn) { setFavIds(new Set()); return; }
    getToken().then((token) => {
      if (!token) return;
      fetch(`${API}/api/favorites`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((favs: { professionalId: string }[]) => setFavIds(new Set(favs.map((f) => f.professionalId))))
        .catch(() => {});
    });
  }, [isSignedIn]);

  function handleToggleFav(id: string, add: boolean) {
    setFavIds((prev) => { const next = new Set(prev); add ? next.add(id) : next.delete(id); return next; });
  }

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const proResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = norm(query);
    const base = activePill === "oficios" ? professionals : activePill === "profesionales" ? professionals : [];
    return base.filter((p) =>
      norm(`${p.nombre} ${p.apellido}`).includes(q) ||
      norm(p.oficios.join(" ")).includes(q) ||
      norm(p.barrio).includes(q) ||
      norm(p.descripcion ?? "").includes(q)
    );
  }, [query, professionals, activePill]);

  const comercioResults = useMemo(() => {
    if (!query.trim() || activePill !== "comercios") return [];
    const q = norm(query);
    return comercios.filter((c) =>
      norm(c.nombre).includes(q) || norm(c.rubro).includes(q) || norm(c.barrio).includes(q) || norm(c.descripcion ?? "").includes(q)
    );
  }, [query, comercios, activePill]);

  const empleadoResults = useMemo(() => {
    if (!query.trim() || activePill !== "empleados") return [];
    const q = norm(query);
    return empleados.filter((e) =>
      norm(`${e.nombre} ${e.apellido}`).includes(q) ||
      norm(e.habilidades.join(" ")).includes(q) ||
      norm(e.barrio ?? "").includes(q) ||
      norm(e.descripcion ?? "").includes(q)
    );
  }, [query, empleados, activePill]);

  const totalResults = proResults.length + comercioResults.length + empleadoResults.length;
  const showResults = query.trim().length > 0;

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const inputBg = isDark ? "bg-gray-900 border-gray-700 focus:border-gray-500" : "bg-white border-gray-300 focus:border-gray-400 shadow-sm";
  const inputColor = isDark ? "#f9fafb" : "#111827";
  const labelColor = isDark ? "text-gray-400" : "text-gray-500";

  const pillConfig: { key: Pill; label: string; color: string; activeBg: string; activeBorder: string }[] = [
    { key: "profesionales", label: "Profesionales", color: "text-gray-300", activeBg: isDark ? "bg-gray-700" : "bg-gray-900", activeBorder: isDark ? "border-gray-600" : "border-gray-700" },
    { key: "comercios", label: "Comercios", color: "text-amber-400", activeBg: "bg-amber-900/60", activeBorder: "border-amber-700" },
    { key: "oficios", label: "Oficios", color: "text-purple-400", activeBg: "bg-purple-900/60", activeBorder: "border-purple-700" },
    { key: "empleados", label: "Empleados", color: "text-blue-400", activeBg: "bg-blue-900/60", activeBorder: "border-blue-700" },
  ];

  const placeholders: Record<Pill, string> = {
    profesionales: "Buscar plomero, electricista, albañil...",
    comercios: "Buscar comercio, rubro, barrio...",
    oficios: "Buscar oficio o barrio...",
    empleados: "Buscar por nombre, habilidad o barrio...",
  };

  const featuredLabels: Record<Pill, string> = {
    profesionales: "Profesionales destacados",
    comercios: "Comercios destacados",
    oficios: "Explorar oficios",
    empleados: "Perfiles disponibles",
  };

  const registerLinks: Record<Pill, { href: string; label: string }> = {
    profesionales: { href: "/profesional/nuevo", label: "Registrarte como profesional" },
    comercios: { href: "/comercio/nuevo", label: "Registrar tu comercio" },
    oficios: { href: "/profesional/nuevo", label: "Registrarte como profesional" },
    empleados: { href: "/empleado/nuevo", label: "Publicar tu perfil de empleado" },
  };

  return (
    <div className={`min-h-screen pb-24 md:pb-0 ${bg} transition-colors duration-300 flex flex-col`}>
      <Navbar totalReports={0} onMenuClick={() => {}} sidebarDisabled mapView="profesionales" />

      {/* Toggle tema */}
      <button
        onClick={toggleTheme}
        className={`fixed top-3 right-20 z-[1003] p-2 rounded-full transition-colors ${
          isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-600 hover:bg-gray-100 shadow"
        }`}
        title={isDark ? "Modo claro" : "Modo oscuro"}
      >
        {isDark ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col">
        <div
          className="w-full transition-all duration-500 ease-in-out"
          style={{ paddingTop: showResults ? "4rem" : "calc(50vh - 210px)" }}
        >
          <div className="max-w-2xl mx-auto px-4">

            {/* Titulo — se oculta al buscar */}
            <div
              className="transition-all duration-300 overflow-hidden"
              style={{ maxHeight: showResults ? "0" : "160px", opacity: showResults ? 0 : 1 }}
            >
              <p className={`text-xs font-semibold tracking-widest uppercase mb-3 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Reconquista · Santa Fe
              </p>
              <h1
                className="text-3xl sm:text-5xl font-black leading-tight mb-3 text-center"
                style={
                  isDark
                    ? { fontFamily: "var(--font-montserrat)", background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
                    : { fontFamily: "var(--font-montserrat)", color: "#111827" }
                }
              >
                Oficios &amp; Comercios
              </h1>
              <p className={`text-sm mb-5 text-center ${labelColor}`}>
                Profesionales, comercios, oficios y empleados cerca tuyo.
              </p>
            </div>

            {/* Pills */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {pillConfig.map(({ key, label, color, activeBg, activeBorder }) => {
                const isActive = activePill === key;
                return (
                  <button
                    key={key}
                    onClick={() => { setActivePill(key); setQuery(""); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isActive
                        ? `${activeBg} ${activeBorder} ${color}`
                        : isDark
                          ? "bg-transparent border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                          : "bg-transparent border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Search input */}
            <div className="relative mb-8">
              <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholders[activePill]}
                style={{ color: inputColor, backgroundColor: isDark ? "#111827" : "#ffffff" }}
                className={`w-full pl-12 pr-10 py-4 rounded-2xl border text-sm focus:outline-none transition-colors ${inputBg}`}
              />
              {query && (
                <button onClick={() => setQuery("")} className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Resultados */}
            <div
              className="transition-all duration-500"
              style={{ opacity: showResults ? 1 : 0, transform: showResults ? "translateY(0)" : "translateY(8px)", pointerEvents: showResults ? "auto" : "none" }}
            >
              {showResults && (
                <>
                  <p className={`text-sm mb-5 ${labelColor}`}>
                    {totalResults > 0
                      ? `${totalResults} resultado${totalResults !== 1 ? "s" : ""} para "${query}"`
                      : `Sin resultados para "${query}"`}
                  </p>
                  <div className="flex flex-col gap-3">
                    {proResults.map((pro) => <ResultCard key={pro.id} pro={pro} dark={isDark} favIds={favIds} onToggleFav={handleToggleFav} />)}
                    {comercioResults.map((c) => <ComercioResultCard key={c.id} comercio={c} dark={isDark} />)}
                    {empleadoResults.map((e) => <EmpleadoResultCard key={e.id} empleado={e} dark={isDark} />)}
                  </div>
                </>
              )}
            </div>

            {/* Destacados / grid segun pill activa */}
            <div
              className="transition-all duration-300"
              style={{ opacity: showResults ? 0 : 1, pointerEvents: showResults ? "none" : "auto" }}
            >
              {!showResults && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className={`text-sm font-medium ${labelColor}`}>{featuredLabels[activePill]}</p>
                    <Link
                      href={registerLinks[activePill].href}
                      className={`text-xs font-medium transition-colors ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                    >
                      {registerLinks[activePill].label}
                    </Link>
                  </div>

                  {/* Profesionales carousel */}
                  {activePill === "profesionales" && (
                    featured.length > 0
                      ? <InfiniteCarousel items={featured} renderCard={(pro) => <FeaturedCard pro={pro} dark={isDark} />} />
                      : <div className={`text-sm text-center py-8 ${labelColor}`}>Aun no hay profesionales.</div>
                  )}

                  {/* Comercios carousel */}
                  {activePill === "comercios" && (
                    comercios.length > 0
                      ? <InfiniteCarousel items={comercios} renderCard={(c) => <FeaturedComercioCard comercio={c} dark={isDark} />} />
                      : <div className={`text-sm text-center py-8 ${labelColor}`}>Aun no hay comercios registrados.</div>
                  )}

                  {/* Oficios grid de categorias */}
                  {activePill === "oficios" && (
                    <OficiosCategoryGrid
                      professionals={professionals}
                      dark={isDark}
                      onSelect={(oficio) => setQuery(oficio)}
                    />
                  )}

                  {/* Empleados carousel */}
                  {activePill === "empleados" && (
                    empleados.filter((e) => e.disponible).length > 0
                      ? <InfiniteCarousel
                          items={empleados.filter((e) => e.disponible)}
                          renderCard={(e) => <FeaturedEmpleadoCard empleado={e} dark={isDark} />}
                        />
                      : <div className={`text-sm text-center py-8 ${labelColor}`}>
                          Aun no hay perfiles publicados.{" "}
                          <Link href="/empleado/nuevo" className="text-blue-400 hover:underline">Publicar el tuyo</Link>
                        </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
