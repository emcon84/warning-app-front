"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth, useUser } from "@clerk/nextjs";
import { Professional, Comercio, Empleado, Vacante } from "../types";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Pill = "profesionales" | "comercios" | "oficios" | "empleados";
type EmpleoTab = "cvs" | "vacantes";

interface Props {
  professionals: Professional[];
}

const PROFESION_KEYWORDS = [
  "desarroll",
  "contador",
  "abogad",
  "arquitect",
  "ingenier",
  "diseñ",
  "marketing",
  "administr",
  "docente",
  "psicolog",
  "community",
  "analista",
  "traductor",
  "consultor",
  "escriban",
  "programador",
  "software",
];

const normalizeText = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function getProfessionalType(pro: Professional): "profesion" | "oficio" {
  const explicit = normalizeText(pro.tipo ?? "");
  if (explicit === "profesion" || explicit === "profesional")
    return "profesion";
  if (explicit === "oficio") return "oficio";
  const looksLikeProfesion = pro.oficios.some((o) =>
    PROFESION_KEYWORDS.some((kw) => normalizeText(o).includes(kw)),
  );
  return looksLikeProfesion ? "profesion" : "oficio";
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StarRating({
  rating,
  count,
  dark,
}: {
  rating: number;
  count: number;
  dark: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "text-yellow-400" : dark ? "text-gray-600" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {count > 0 && (
        <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}

function Avatar({
  foto,
  nombre,
  gradient = "from-gray-600 to-gray-700",
}: {
  foto?: string | null;
  nombre: string;
  gradient?: string;
}) {
  if (foto)
    return (
      <Image
        src={foto}
        alt={nombre}
        className="w-full h-full object-cover"
        width={64}
        height={64}
      />
    );
  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-linear-to-br ${gradient} text-2xl font-bold text-white`}
    >
      {nombre[0].toUpperCase()}
    </div>
  );
}

function FeaturedCard({ pro, dark }: { pro: Professional; dark: boolean }) {
  return (
    <Link href={`/profesional/${pro.slug}`} className="block">
      <div className="flex flex-col items-center gap-2 cursor-pointer group w-full">
        <div
          className={`w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 transition-all duration-200 ${dark ? "ring-gray-800 group-hover:ring-gray-500" : "ring-gray-200 group-hover:ring-gray-400 shadow-md"}`}
        >
          <Avatar foto={pro.foto} nombre={pro.nombre} />
        </div>
        <div className="text-center w-full overflow-hidden">
          <p
            className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}
          >
            {pro.nombre}
          </p>
          <p
            className={`text-[11px] capitalize truncate mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}
          >
            {pro.oficios[0]}
          </p>
          {pro.ratingCount > 0 && (
            <div className="flex items-center justify-center gap-0.5 mt-1">
              <svg
                className="w-3 h-3 text-yellow-400 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span
                className={`text-[11px] font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}
              >
                {pro.ratingAvg.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function FeaturedComercioCard({
  comercio,
  dark,
}: {
  comercio: Comercio;
  dark: boolean;
}) {
  return (
    <Link href={`/comercio/${comercio.slug}`} className="block">
      <div className="flex flex-col items-center gap-2 cursor-pointer group w-full">
        <div
          className={`w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 transition-all duration-200 ${dark ? "ring-gray-800 group-hover:ring-amber-700" : "ring-gray-200 group-hover:ring-amber-400 shadow-md"}`}
        >
          <Avatar
            foto={comercio.foto}
            nombre={comercio.nombre}
            gradient="from-amber-700 to-amber-900"
          />
        </div>
        <div className="text-center w-full overflow-hidden">
          <p
            className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}
          >
            {comercio.nombre}
          </p>
          <p
            className={`text-[11px] truncate mt-0.5 ${dark ? "text-amber-500" : "text-amber-600"}`}
          >
            {comercio.rubro}
          </p>
        </div>
      </div>
    </Link>
  );
}

function FeaturedEmpleadoCard({
  empleado,
  dark,
}: {
  empleado: Empleado;
  dark: boolean;
}) {
  return (
    <Link href={`/empleado/${empleado.slug}`} className="block">
      <div className="flex flex-col items-center gap-2 cursor-pointer group w-full">
        <div
          className={`w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 transition-all duration-200 ${dark ? "ring-gray-800 group-hover:ring-blue-700" : "ring-gray-200 group-hover:ring-blue-400 shadow-md"}`}
        >
          <Avatar
            foto={empleado.foto}
            nombre={empleado.nombre}
            gradient="from-blue-700 to-blue-900"
          />
        </div>
        <div className="text-center w-full overflow-hidden">
          <p
            className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}
          >
            {empleado.nombre}
          </p>
          <p
            className={`text-[11px] truncate mt-0.5 ${dark ? "text-blue-400" : "text-blue-600"}`}
          >
            {empleado.habilidades[0]}
          </p>
          <span
            className={`text-[10px] mt-0.5 inline-block ${empleado.disponible ? (dark ? "text-green-400" : "text-green-600") : dark ? "text-gray-500" : "text-gray-400"}`}
          >
            {empleado.disponible ? "Disponible" : "No disponible"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedVacanteCard({
  vacante,
  dark,
}: {
  vacante: Vacante;
  dark: boolean;
}) {
  return (
    <Link href={`/vacante/${vacante.id}`} className="block">
      <div className="flex flex-col items-center gap-2 cursor-pointer group w-full">
        <div
          className={`w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 transition-all duration-200 ${dark ? "ring-gray-800 group-hover:ring-emerald-700" : "ring-gray-200 group-hover:ring-emerald-400 shadow-md"}`}
        >
          <Avatar
            foto={vacante.comercio.foto}
            nombre={vacante.comercio.nombre}
            gradient="from-emerald-700 to-emerald-900"
          />
        </div>
        <div className="text-center w-full overflow-hidden">
          <p
            className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}
          >
            {vacante.titulo}
          </p>
          <p
            className={`text-[11px] truncate mt-0.5 ${dark ? "text-emerald-400" : "text-emerald-600"}`}
          >
            {vacante.comercio.nombre}
          </p>
          {vacante.barrio && (
            <p
              className={`text-[10px] truncate ${dark ? "text-gray-500" : "text-gray-400"}`}
            >
              {vacante.barrio}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

const CAROUSEL_MIN_ITEMS = 6;

function InfiniteCarousel<T extends { id: string }>({
  items,
  renderCard,
}: {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) return null;

  // Con pocos items, fila estática sin animación
  if (items.length < CAROUSEL_MIN_ITEMS) {
    return (
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-4 pb-1">
          {items.map((item) => (
            <div key={item.id} className="shrink-0 w-20">
              {renderCard(item)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const itemSlot = 96;
  const copiesPerHalf = Math.max(
    2,
    Math.ceil(1600 / (items.length * itemSlot)),
  );
  const totalCopies = copiesPerHalf * 2;
  const repeated = Array.from(
    { length: totalCopies * items.length },
    (_, i) => items[i % items.length],
  );
  const halfWidthPx = copiesPerHalf * items.length * itemSlot;
  const duration = Math.round(halfWidthPx / 50);
  return (
    <div className="overflow-hidden -mx-4">
      <div
        className="flex carousel-marquee"
        style={{ gap: "1rem", animationDuration: `${duration}s` }}
      >
        {repeated.map((item, i) => (
          <div key={`${item.id}-${i}`} className="shrink-0 w-20">
            {renderCard(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORIAS_OFICIOS = [
  "Plomero", "Electricista", "Albañil", "Pintor", "Gasista",
  "Jardinero", "Herrero", "Carpintero", "Cerrajero", "Techista",
  "Soldador", "Fumigador", "Limpieza", "Flete", "Climatización",
  "Mecánico", "Pinchazos", "Yesero", "Instalador",
];

function OficiosCategoryGrid({
  professionals,
  dark,
  onSelect,
}: {
  professionals: Professional[];
  dark: boolean;
  onSelect: (o: string) => void;
}) {
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Oficios personalizados de profesionales tipo "oficio" que no están en la lista predefinida
  const customOficios = useMemo(() => {
    const predefinedNorm = new Set(CATEGORIAS_OFICIOS.map((c) => norm(c)));
    const custom = new Set<string>();
    professionals
      .filter((p) => p.tipo === "oficio" || p.tipo == null)
      .forEach((p) =>
        (p.oficios ?? []).forEach((o) => {
          const oNorm = norm(o);
          const alreadyCovered = [...predefinedNorm].some(
            (pre) => oNorm.includes(pre) || pre.includes(oNorm)
          );
          if (!alreadyCovered) custom.add(o);
        })
      );
    return [...custom].sort();
  }, [professionals]);

  const allCategories = useMemo(
    () => [...CATEGORIAS_OFICIOS, ...customOficios],
    [customOficios]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    allCategories.forEach((cat) => {
      const catNorm = norm(cat);
      map[cat] = professionals.filter((p) =>
        (p.oficios ?? []).some((o) => norm(o).includes(catNorm) || catNorm.includes(norm(o)))
      ).length;
    });
    return map;
  }, [professionals, allCategories]);

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => {
        const count = counts[cat] ?? 0;
        const isCustom = !CATEGORIAS_OFICIOS.includes(cat);
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              count > 0
                ? dark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
                : dark
                  ? "bg-gray-900 text-gray-600 border border-gray-800 hover:border-gray-700"
                  : "bg-gray-50 text-gray-400 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {cat}
            {count > 0 && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                isCustom
                  ? dark ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"
                  : dark ? "bg-purple-900/50 text-purple-400" : "bg-purple-100 text-purple-600"
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function ResultCard({
  pro,
  dark,
  favIds,
  onToggleFav,
}: {
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
      if (!token) {
        onToggleFav(pro.id, !wasAdding);
        return;
      }
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const res = wasAdding
        ? await fetch(`${API}/api/favorites`, {
            method: "POST",
            headers,
            body: JSON.stringify({ professionalId: pro.id }),
          })
        : await fetch(`${API}/api/favorites/${pro.id}`, {
            method: "DELETE",
            headers,
          });
      if (!res.ok) onToggleFav(pro.id, !wasAdding);
    } catch {
      onToggleFav(pro.id, !wasAdding);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Link href={`/profesional/${pro.slug}`}>
      <div
        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${dark ? "bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"}`}
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow">
          <Avatar foto={pro.foto} nombre={pro.nombre} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}
            >
              {pro.nombre} {pro.apellido}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${pro.disponible ? "bg-green-900/40 text-green-400 border-green-800" : dark ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-400 border-gray-200"}`}
            >
              {pro.disponible ? "Disponible" : "No disponible"}
            </span>
          </div>
          <p
            className={`text-sm capitalize mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}
          >
            {pro.oficios.join(", ")}
          </p>
          <p
            className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}
          >
            {pro.barrio}
          </p>
          <div className="mt-1.5">
            <StarRating
              rating={pro.ratingAvg}
              count={pro.ratingCount}
              dark={dark}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isSignedIn && (
            <button
              onClick={toggle}
              disabled={loading}
              className="group p-1.5 rounded-full"
            >
              <HeartIcon filled={isFav} dark={dark} />
            </button>
          )}
          <svg
            className={`w-5 h-5 ${dark ? "text-gray-600" : "text-gray-300"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function ComercioResultCard({
  comercio,
  dark,
}: {
  comercio: Comercio;
  dark: boolean;
}) {
  return (
    <Link href={`/comercio/${comercio.slug}`}>
      <div
        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${dark ? "bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"}`}
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow">
          {comercio.foto ? (
            <Image
              src={comercio.foto}
              alt={comercio.nombre}
              className="w-full h-full object-cover"
              width={64}
              height={64}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-amber-700 to-amber-900 text-2xl font-bold text-white">
              {comercio.nombre[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}
            >
              {comercio.nombre}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${dark ? "bg-amber-900/40 text-amber-400 border-amber-800" : "bg-amber-50 text-amber-600 border-amber-200"}`}
            >
              Comercio
            </span>
          </div>
          <p
            className={`text-sm mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}
          >
            {comercio.rubro}
          </p>
          <p
            className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}
          >
            {comercio.barrio}
          </p>
        </div>
        <svg
          className={`w-5 h-5 shrink-0 ${dark ? "text-gray-600" : "text-gray-300"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}

function EmpleadoResultCard({
  empleado,
  dark,
}: {
  empleado: Empleado;
  dark: boolean;
}) {
  return (
    <Link href={`/empleado/${empleado.slug}`}>
      <div
        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${dark ? "bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"}`}
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow">
          <Avatar
            foto={empleado.foto}
            nombre={empleado.nombre}
            gradient="from-blue-700 to-blue-900"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}
            >
              {empleado.nombre} {empleado.apellido}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${empleado.disponible ? "bg-green-900/40 text-green-400 border-green-800" : dark ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-400 border-gray-200"}`}
            >
              {empleado.disponible ? "Disponible" : "No disponible"}
            </span>
          </div>
          <p
            className={`text-sm mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}
          >
            {empleado.habilidades.slice(0, 3).join(", ")}
          </p>
          {empleado.barrio && (
            <p
              className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}
            >
              {empleado.barrio}
            </p>
          )}
        </div>
        <svg
          className={`w-5 h-5 shrink-0 ${dark ? "text-gray-600" : "text-gray-300"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}

function VacanteResultCard({
  vacante,
  dark,
}: {
  vacante: Vacante;
  dark: boolean;
}) {
  return (
    <Link href={`/vacante/${vacante.id}`}>
      <div
        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${dark ? "bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"}`}
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow">
          <Avatar
            foto={vacante.comercio.foto}
            nombre={vacante.comercio.nombre}
            gradient="from-emerald-700 to-emerald-900"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}
            >
              {vacante.titulo}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${dark ? "bg-emerald-900/40 text-emerald-400 border-emerald-800" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}
            >
              Vacante
            </span>
          </div>
          <p
            className={`text-sm mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}
          >
            {vacante.comercio.nombre} · {vacante.comercio.rubro}
          </p>
          {vacante.barrio && (
            <p
              className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}
            >
              {vacante.barrio}
            </p>
          )}
          {vacante.habilidades.length > 0 && (
            <p
              className={`text-xs mt-1 ${dark ? "text-gray-600" : "text-gray-400"}`}
            >
              {vacante.habilidades.slice(0, 3).join(", ")}
            </p>
          )}
        </div>
        <svg
          className={`w-5 h-5 shrink-0 ${dark ? "text-gray-600" : "text-gray-300"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ProfesionalesClient({ professionals }: Props) {
  const [query, setQuery] = useState("");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return saved ? saved === "dark" : true;
    }
    return true;
  });
  const [activePill, setActivePill] = useState<Pill>("profesionales");
  const [empleoTab, setEmpleoTab] = useState<EmpleoTab>("cvs");
  const [favIds, setFavIds] = useState<Set<string>>(() => {
    return new Set();
  });
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    fetch(`${API}/api/comercios`)
      .then((r) => r.json())
      .then((d: Comercio[]) => setComercios(d))
      .catch((error) => {
        console.error("Error fetching comercios:", error);
      });
    fetch(`${API}/api/empleados`)
      .then((r) => r.json())
      .then((d: Empleado[]) => setEmpleados(d))
      .catch((error) => {
        console.error("Error fetching empleados:", error);
      });
    fetch(`${API}/api/vacantes`)
      .then((r) => r.json())
      .then((d: Vacante[]) => setVacantes(d))
      .catch((error) => {
        console.error("Error fetching vacantes:", error);
      });
  }, []);

  const prevIsSignedInRef = useRef(isSignedIn);

  useEffect(() => {
    if (!isSignedIn && prevIsSignedInRef.current) {
      setTimeout(() => setFavIds(new Set()), 0);
    }
    prevIsSignedInRef.current = isSignedIn;
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    let isMounted = true;
    getToken().then((token) => {
      if (!token || !isMounted) return;
      fetch(`${API}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((favs: { professionalId: string }[]) => {
          if (isMounted) {
            setFavIds(new Set(favs.map((f) => f.professionalId)));
          }
        })
        .catch((error) => {
          console.error("Error fetching favorites:", error);
        });
    });
    return () => {
      isMounted = false;
    };
  }, [isSignedIn, getToken]);

  function handleToggleFav(id: string, add: boolean) {
    setFavIds((prev) => {
      const next = new Set(prev);
      if (add) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const professionalProfiles = useMemo(
    () => professionals.filter((p) => getProfessionalType(p) === "profesion"),
    [professionals],
  );
  const oficioProfiles = useMemo(
    () => professionals.filter((p) => getProfessionalType(p) === "oficio"),
    [professionals],
  );
  const featuredProfessionals = useMemo(
    () => professionalProfiles.slice(0, 6),
    [professionalProfiles],
  );

  const proResults = useMemo(() => {
    if (
      !query.trim() ||
      (activePill !== "profesionales" && activePill !== "oficios")
    )
      return [];
    const q = normalizeText(query);
    const base =
      activePill === "profesionales" ? professionalProfiles : oficioProfiles;
    return base.filter(
      (p) =>
        normalizeText(`${p.nombre} ${p.apellido}`).includes(q) ||
        normalizeText(p.oficios.join(" ")).includes(q) ||
        normalizeText(p.barrio).includes(q) ||
        normalizeText(p.descripcion ?? "").includes(q),
    );
  }, [query, activePill, professionalProfiles, oficioProfiles]);

  const comercioResults = useMemo(() => {
    if (!query.trim() || activePill !== "comercios") return [];
    const q = normalizeText(query);
    return comercios.filter(
      (c) =>
        normalizeText(c.nombre).includes(q) ||
        normalizeText(c.rubro).includes(q) ||
        normalizeText(c.barrio).includes(q) ||
        normalizeText(c.descripcion ?? "").includes(q),
    );
  }, [query, comercios, activePill]);

  const empleadoResults = useMemo(() => {
    if (!query.trim() || activePill !== "empleados" || empleoTab !== "cvs")
      return [];
    const q = normalizeText(query);
    return empleados.filter(
      (e) =>
        normalizeText(`${e.nombre} ${e.apellido}`).includes(q) ||
        normalizeText(e.habilidades.join(" ")).includes(q) ||
        normalizeText(e.barrio ?? "").includes(q) ||
        normalizeText(e.descripcion ?? "").includes(q),
    );
  }, [query, empleados, activePill, empleoTab]);

  const vacanteResults = useMemo(() => {
    if (!query.trim() || activePill !== "empleados" || empleoTab !== "vacantes")
      return [];
    const q = normalizeText(query);
    return vacantes.filter(
      (v) =>
        normalizeText(v.titulo).includes(q) ||
        normalizeText(v.comercio.nombre).includes(q) ||
        normalizeText(v.habilidades.join(" ")).includes(q) ||
        normalizeText(v.barrio ?? "").includes(q) ||
        normalizeText(v.descripcion).includes(q),
    );
  }, [query, vacantes, activePill, empleoTab]);

  const totalResults =
    proResults.length +
    comercioResults.length +
    empleadoResults.length +
    vacanteResults.length;
  const showResults = query.trim().length > 0;

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const inputBg = isDark
    ? "bg-gray-900 border-gray-700 focus:border-gray-500"
    : "bg-white border-gray-300 focus:border-gray-400 shadow-sm";
  const inputColor = isDark ? "#f9fafb" : "#111827";
  const labelColor = isDark ? "text-gray-400" : "text-gray-500";

  const pillConfig: {
    key: Pill;
    label: string;
    color: string;
    activeBg: string;
    activeBorder: string;
  }[] = [
    {
      key: "profesionales",
      label: "Profesionales",
      color: "text-gray-300",
      activeBg: isDark ? "bg-gray-700" : "bg-gray-900",
      activeBorder: isDark ? "border-gray-600" : "border-gray-700",
    },
    {
      key: "comercios",
      label: "Comercios",
      color: "text-amber-400",
      activeBg: "bg-amber-900/60",
      activeBorder: "border-amber-700",
    },
    {
      key: "oficios",
      label: "Oficios",
      color: "text-purple-400",
      activeBg: "bg-purple-900/60",
      activeBorder: "border-purple-700",
    },
    {
      key: "empleados",
      label: "Empleos",
      color: "text-emerald-400",
      activeBg: "bg-emerald-900/60",
      activeBorder: "border-emerald-700",
    },
  ];

  const placeholders: Record<Pill, string> = {
    profesionales: "Buscar plomero, electricista, albañil...",
    comercios: "Buscar comercio, rubro, barrio...",
    oficios: "Buscar oficio o barrio...",
    empleados:
      empleoTab === "cvs"
        ? "Buscar CV por nombre, habilidad..."
        : "Buscar vacante por puesto, empresa...",
  };

  return (
    <div
      className={`min-h-screen pb-24 md:pb-0 ${bg} transition-colors duration-300 flex flex-col`}
    >
      <Navbar
        totalReports={0}
        onMenuClick={() => {}}
        sidebarDisabled
        mapView="profesionales"
      />

      {/* Toggle tema */}
      <button
        onClick={toggleTheme}
        className={`fixed top-3 right-20 z-1003 p-2 rounded-full transition-colors ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-600 hover:bg-gray-100 shadow"}`}
        title={isDark ? "Modo claro" : "Modo oscuro"}
      >
        {isDark ? (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col">
        <div
          className="w-full transition-all duration-500 ease-in-out"
          style={{ paddingTop: showResults ? "4rem" : "calc(50vh - 210px)" }}
        >
          <div className="max-w-2xl mx-auto px-4">
            {/* Titulo */}
            <div
              className="transition-all duration-300 overflow-hidden"
              style={{
                maxHeight: showResults ? "0" : "160px",
                opacity: showResults ? 0 : 1,
              }}
            >
              <p
                className={`text-xs font-semibold tracking-widest uppercase mb-3 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                Reconquista · Santa Fe
              </p>
              <h1
                suppressHydrationWarning
                className="text-3xl sm:text-5xl font-black leading-tight mb-3 text-center"
                style={
                  isDark
                    ? {
                        fontFamily: "var(--font-montserrat)",
                        background:
                          "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }
                    : { fontFamily: "var(--font-montserrat)", color: "#111827" }
                }
              >
                {"Oficios, Comercios & Empleos"}
              </h1>
              <p className={`text-sm mb-5 text-center ${labelColor}`}>
                Encontra profesionales, comercios, oficios, CVs y vacantes.
              </p>
            </div>

            {/* Pills principales */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {pillConfig.map(
                ({ key, label, color, activeBg, activeBorder }) => {
                  const isActive = activePill === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setActivePill(key);
                        setQuery("");
                      }}
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
                },
              )}
            </div>

            {/* Sub-tabs de Empleos */}
            {activePill === "empleados" && (
              <div
                className={`flex gap-1 p-1 rounded-xl mb-4 ${isDark ? "bg-gray-900 border border-gray-800" : "bg-gray-100 border border-gray-200"}`}
              >
                <button
                  onClick={() => {
                    setEmpleoTab("cvs");
                    setQuery("");
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    empleoTab === "cvs"
                      ? isDark
                        ? "bg-blue-600 text-white shadow"
                        : "bg-white text-blue-700 shadow"
                      : isDark
                        ? "text-gray-500 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Busco trabajo
                </button>
                <button
                  onClick={() => {
                    setEmpleoTab("vacantes");
                    setQuery("");
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    empleoTab === "vacantes"
                      ? isDark
                        ? "bg-blue-600 text-white shadow"
                        : "bg-white text-blue-700 shadow"
                      : isDark
                        ? "text-gray-500 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Busco empleado
                </button>
              </div>
            )}

            {/* Search input */}
            <div className="relative mb-8">
              <svg
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholders[activePill]}
                style={{
                  color: inputColor,
                  backgroundColor: isDark ? "#111827" : "#ffffff",
                }}
                className={`w-full pl-12 pr-10 py-4 rounded-2xl border text-sm focus:outline-none transition-colors ${inputBg}`}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
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
                    {totalResults > 0
                      ? `${totalResults} resultado${totalResults !== 1 ? "s" : ""} para "${query}"`
                      : `Sin resultados para "${query}"`}
                  </p>
                  <div className="flex flex-col gap-3">
                    {proResults.map((pro) => (
                      <ResultCard
                        key={pro.id}
                        pro={pro}
                        dark={isDark}
                        favIds={favIds}
                        onToggleFav={handleToggleFav}
                      />
                    ))}
                    {comercioResults.map((c) => (
                      <ComercioResultCard
                        key={c.id}
                        comercio={c}
                        dark={isDark}
                      />
                    ))}
                    {empleadoResults.map((e) => (
                      <EmpleadoResultCard
                        key={e.id}
                        empleado={e}
                        dark={isDark}
                      />
                    ))}
                    {vacanteResults.map((v) => (
                      <VacanteResultCard key={v.id} vacante={v} dark={isDark} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Destacados */}
            <div
              className="transition-all duration-300"
              style={{
                opacity: showResults ? 0 : 1,
                pointerEvents: showResults ? "none" : "auto",
              }}
            >
              {!showResults && (
                <>
                  {/* Profesionales */}
                  {activePill === "profesionales" && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <p className={`text-sm font-medium ${labelColor}`}>
                          Profesionales destacados
                        </p>
                        <Link
                          href="/profesional/nuevo"
                          className={`text-xs font-medium ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                        >
                          Registrarme
                        </Link>
                      </div>
                      {featuredProfessionals.length > 0 ? (
                        <InfiniteCarousel
                          items={featuredProfessionals}
                          renderCard={(p) => (
                            <FeaturedCard pro={p} dark={isDark} />
                          )}
                        />
                      ) : (
                        <div
                          className={`text-sm text-center py-8 ${labelColor}`}
                        >
                          Aun no hay perfiles profesionales.
                        </div>
                      )}
                    </>
                  )}

                  {/* Comercios */}
                  {activePill === "comercios" && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <p className={`text-sm font-medium ${labelColor}`}>
                          Comercios destacados
                        </p>
                        <Link
                          href="/comercio/nuevo"
                          className={`text-xs font-medium ${isDark ? "text-amber-400 hover:text-amber-300" : "text-amber-600 hover:text-amber-700"}`}
                        >
                          Registrar comercio
                        </Link>
                      </div>
                      {comercios.length > 0 ? (
                        <InfiniteCarousel
                          items={comercios}
                          renderCard={(c) => (
                            <FeaturedComercioCard comercio={c} dark={isDark} />
                          )}
                        />
                      ) : (
                        <div
                          className={`text-sm text-center py-8 ${labelColor}`}
                        >
                          Aun no hay comercios.
                        </div>
                      )}
                    </>
                  )}

                  {/* Oficios */}
                  {activePill === "oficios" && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <p className={`text-sm font-medium ${labelColor}`}>
                          Explorar oficios
                        </p>
                        <Link
                          href="/profesional/nuevo"
                          className={`text-xs font-medium ${isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"}`}
                        >
                          Registrarme
                        </Link>
                      </div>
                      <OficiosCategoryGrid
                        professionals={oficioProfiles}
                        dark={isDark}
                        onSelect={(o) => setQuery(o)}
                      />
                    </>
                  )}

                  {/* Empleos — sub-tabs */}
                  {activePill === "empleados" && empleoTab === "cvs" && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <p className={`text-sm font-medium ${labelColor}`}>
                          CVs disponibles
                        </p>
                        <Link
                          href="/empleado/nuevo"
                          className={`text-xs font-medium ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                        >
                          Subir mi CV
                        </Link>
                      </div>
                      {empleados.filter((e) => e.disponible).length > 0 ? (
                        <InfiniteCarousel
                          items={empleados.filter((e) => e.disponible)}
                          renderCard={(e) => (
                            <FeaturedEmpleadoCard empleado={e} dark={isDark} />
                          )}
                        />
                      ) : (
                        <div
                          className={`text-sm text-center py-8 ${labelColor}`}
                        >
                          Aun no hay CVs publicados.{" "}
                          <Link
                            href="/empleado/nuevo"
                            className="text-blue-400 hover:underline"
                          >
                            Publicar el tuyo
                          </Link>
                        </div>
                      )}
                    </>
                  )}

                  {activePill === "empleados" && empleoTab === "vacantes" && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <p className={`text-sm font-medium ${labelColor}`}>
                          Ultimas vacantes
                        </p>
                        <Link
                          href="/vacante/nueva"
                          className={`text-xs font-medium ${isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"}`}
                        >
                          Publicar vacante
                        </Link>
                      </div>
                      {vacantes.length > 0 ? (
                        <InfiniteCarousel
                          items={vacantes}
                          renderCard={(v) => (
                            <FeaturedVacanteCard vacante={v} dark={isDark} />
                          )}
                        />
                      ) : (
                        <div
                          className={`text-sm text-center py-8 ${labelColor}`}
                        >
                          Aun no hay vacantes publicadas.
                        </div>
                      )}
                    </>
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
