"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { Professional } from "../types";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Props {
  professionals: Professional[];
  featured: Professional[];
}

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

function Avatar({ foto, nombre }: { foto?: string | null; nombre: string }) {
  if (foto) return <img src={foto} alt={nombre} className="w-full h-full object-cover" />;
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-700 text-2xl font-bold text-white">
      {nombre[0].toUpperCase()}
    </div>
  );
}

function FeaturedCard({ pro, dark }: { pro: Professional; dark: boolean }) {
  return (
    <Link href={`/profesional/${pro.slug}`}>
      <div className="flex flex-col items-center gap-2.5 cursor-pointer group">
        {/* Avatar */}
        <div className={`w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 transition-all duration-200 ${
          dark
            ? "ring-gray-800 group-hover:ring-gray-500"
            : "ring-gray-200 group-hover:ring-gray-400 shadow-md"
        }`}>
          <Avatar foto={pro.foto} nombre={pro.nombre} />
        </div>
        {/* Info */}
        <div className="text-center">
          <p className={`text-sm font-semibold leading-tight ${dark ? "text-white" : "text-gray-900"}`}>
            {pro.nombre}
          </p>
          <p className={`text-xs capitalize mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>
            {pro.oficios[0]}
          </p>
          {pro.ratingCount > 0 && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className={`text-xs font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>
                {pro.ratingAvg.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
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
    onToggleFav(pro.id, wasAdding); // optimistic
    try {
      const token = await getToken();
      if (!token) { onToggleFav(pro.id, !wasAdding); return; }
      const headers: Record<string, string> = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const res = wasAdding
        ? await fetch(`${API}/api/favorites`, { method: "POST", headers, body: JSON.stringify({ professionalId: pro.id }) })
        : await fetch(`${API}/api/favorites/${pro.id}`, { method: "DELETE", headers });
      if (!res.ok) {
        console.error("[fav] API error:", res.status, await res.text());
        onToggleFav(pro.id, !wasAdding); // revert
      }
    } catch (err) {
      console.error("[fav] fetch error:", err);
      onToggleFav(pro.id, !wasAdding); // revert
    } finally {
      setLoading(false);
    }
  }

  return (
    <Link href={`/profesional/${pro.slug}`}>
      <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
        dark
          ? "bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800"
          : "bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"
      }`}>
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow">
          <Avatar foto={pro.foto} nombre={pro.nombre} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
              {pro.nombre} {pro.apellido}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${
              pro.disponible
                ? "bg-green-900/40 text-green-400 border-green-800"
                : dark ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-400 border-gray-200"
            }`}>
              {pro.disponible ? "Disponible" : "No disponible"}
            </span>
          </div>
          <p className={`text-sm capitalize mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {pro.oficios.join(", ")}
          </p>
          <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{pro.barrio}</p>
          <div className="mt-1.5">
            <StarRating rating={pro.ratingAvg} count={pro.ratingCount} dark={dark} />
          </div>
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

export default function ProfesionalesClient({ professionals, featured }: Props) {
  const [query, setQuery] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setIsDark(saved ? saved === "dark" : true);
  }, []);

  // Carga favoritos UNA sola vez cuando el usuario está autenticado
  useEffect(() => {
    if (!isSignedIn) { setFavIds(new Set()); return; }
    getToken().then((token) => {
      if (!token) return;
      fetch(`${API}/api/favorites`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((favs: { professionalId: string }[]) => {
          setFavIds(new Set(favs.map((f) => f.professionalId)));
        })
        .catch(() => {});
    });
  }, [isSignedIn]);

  function handleToggleFav(id: string, add: boolean) {
    setFavIds((prev) => {
      const next = new Set(prev);
      add ? next.add(id) : next.delete(id);
      return next;
    });
  }

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return professionals.filter((p) => {
      const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return (
        norm(`${p.nombre} ${p.apellido}`).includes(q) ||
        norm(p.oficios.join(" ")).includes(q) ||
        norm(p.barrio).includes(q) ||
        norm(p.descripcion ?? "").includes(q)
      );
    });
  }, [query, professionals]);

  const showResults = query.trim().length > 0;

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const inputBg = isDark ? "bg-gray-900 border-gray-700 focus:border-gray-500" : "bg-white border-gray-300 focus:border-gray-400 shadow-sm";
  const inputColor = isDark ? "#f9fafb" : "#111827";
  const labelColor = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 flex flex-col`}>
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
        {/* Buscador — animado de centro a top */}
        <div
          className="w-full transition-all duration-500 ease-in-out"
          style={{ paddingTop: showResults ? "5rem" : "calc(50vh - 170px)" }}
        >
          <div className="max-w-2xl mx-auto px-4">

            {/* Título — se oculta al buscar */}
            <div
              className="transition-all duration-300 overflow-hidden"
              style={{ maxHeight: showResults ? "0" : "140px", opacity: showResults ? 0 : 1 }}
            >
              <p className={`text-xs font-semibold tracking-widest uppercase mb-3 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Reconquista · Santa Fe
              </p>
              <h1
                className="text-5xl font-black leading-tight mb-3 text-center"
                style={{
                  fontFamily: "var(--font-montserrat)",
                  background: isDark
                    ? "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)"
                    : "linear-gradient(135deg, #111827 0%, #6b7280 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Oficios &amp; Servicios
              </h1>
              <p className={`text-sm mb-6 text-center ${labelColor}`}>
                Plomeros, electricistas, gasistas y más — cerca tuyo.
              </p>
            </div>

            {/* Search input */}
            <div className="relative mb-10">
              <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar plomero, electricista, etc."
                style={{ color: inputColor }}
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
              style={{
                opacity: showResults ? 1 : 0,
                transform: showResults ? "translateY(0)" : "translateY(8px)",
                pointerEvents: showResults ? "auto" : "none",
              }}
            >
              {showResults && (
                <>
                  <p className={`text-sm mb-5 ${labelColor}`}>
                    {results.length > 0
                      ? `${results.length} resultado${results.length !== 1 ? "s" : ""} para "${query}"`
                      : `Sin resultados para "${query}"`}
                  </p>
                  <div className="flex flex-col gap-3">
                    {results.map((pro) => <ResultCard key={pro.id} pro={pro} dark={isDark} favIds={favIds} onToggleFav={handleToggleFav} />)}
                  </div>
                </>
              )}
            </div>

            {/* Destacados */}
            <div
              className="transition-all duration-300"
              style={{ opacity: showResults ? 0 : 1, pointerEvents: showResults ? "none" : "auto" }}
            >
              {!showResults && (
                <>
                  <p className={`text-sm font-medium mb-5 ${labelColor}`}>Profesionales destacados</p>
                  {featured.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
                      {featured.map((pro) => <FeaturedCard key={pro.id} pro={pro} dark={isDark} />)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>Aún no hay profesionales registrados.</p>
                      <Link href="/profesional/nuevo" className="mt-3 text-sm text-blue-400 hover:underline">
                        Registrarte como profesional →
                      </Link>
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
