"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import type { Professional, Comercio, Empleado, Vacante } from "../types";
import Navbar from "../components/Navbar";
import { useTheme } from "../contexts/ThemeContext";
import { normalizeText, getProfessionalType } from "../lib/utils/professionals";
import {
  InfiniteCarousel,
  FeaturedProfessionalCard,
  FeaturedStoreCard,
  FeaturedEmployeeCard,
  FeaturedVacancyCard,
  JobCategoryGrid,
  ProfessionalResultCard,
  StoreResultCard,
  EmployeeResultCard,
  VacancyResultCard,
} from "./components";

import { API_URL } from "../../lib/api/client";

type Pill = "profesionales" | "comercios" | "oficios" | "empleados";
type EmpleoTab = "cvs" | "vacantes";

interface Props {
  professionals: Professional[];
}

const PILL_CONFIG: { key: Pill; label: string }[] = [
  { key: "profesionales", label: "Profesionales" },
  { key: "comercios", label: "Comercios" },
  { key: "oficios", label: "Oficios" },
  { key: "empleados", label: "Empleos" },
];

const PLACEHOLDERS: Record<Pill, string | ((tab: EmpleoTab) => string)> = {
  profesionales: "Buscar plomero, electricista, albañil...",
  comercios: "Buscar comercio, rubro, barrio...",
  oficios: "Buscar oficio o barrio...",
  empleados: (tab) =>
    tab === "cvs" ? "Buscar CV por nombre, habilidad..." : "Buscar vacante por puesto, empresa...",
};

export default function ProfesionalesClient({ professionals }: Props) {
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");
  const [activePill, setActivePill] = useState<Pill>("profesionales");
  const [empleoTab, setEmpleoTab] = useState<EmpleoTab>("cvs");
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    Promise.all([
      fetch(`/api/comercios`).then((r) => r.json()),
      fetch(`/api/empleados`).then((r) => r.json()),
      fetch(`/api/vacantes`).then((r) => r.json()),
    ]).then(([stores, employees, jobs]) => {
      setComercios(stores);
      setEmpleados(employees);
      setVacantes(jobs);
    }).catch(() => {});
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
    let mounted = true;
    getToken().then((token) => {
      if (!token || !mounted) return;
      fetch(`/api/favorites`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((favs: { professionalId: string }[]) => {
          if (mounted) setFavIds(new Set(favs.map((f) => f.professionalId)));
        })
        .catch(() => {});
    });
    return () => { mounted = false; };
  }, [isSignedIn, getToken]);

  function handleToggleFav(id: string, add: boolean) {
    setFavIds((prev) => {
      const next = new Set(prev);
      add ? next.add(id) : next.delete(id);
      return next;
    });
  }

  const professionalProfiles = useMemo(
    () => professionals.filter((p) => getProfessionalType(p) === "profesion"),
    [professionals]
  );
  const oficioProfiles = useMemo(
    () => professionals.filter((p) => getProfessionalType(p) === "oficio"),
    [professionals]
  );

  const proResults = useMemo(() => {
    if (!query.trim() || (activePill !== "profesionales" && activePill !== "oficios")) return [];
    const q = normalizeText(query);
    const base = activePill === "profesionales" ? professionalProfiles : oficioProfiles;
    return base.filter((p) =>
      normalizeText(`${p.nombre} ${p.apellido}`).includes(q) ||
      normalizeText(p.oficios.join(" ")).includes(q) ||
      normalizeText(p.barrio).includes(q) ||
      normalizeText(p.descripcion ?? "").includes(q)
    );
  }, [query, activePill, professionalProfiles, oficioProfiles]);

  const comercioResults = useMemo(() => {
    if (!query.trim() || activePill !== "comercios") return [];
    const q = normalizeText(query);
    return comercios.filter((c) =>
      normalizeText(c.nombre).includes(q) ||
      normalizeText(c.rubro).includes(q) ||
      normalizeText(c.barrio).includes(q) ||
      normalizeText(c.descripcion ?? "").includes(q)
    );
  }, [query, comercios, activePill]);

  const empleadoResults = useMemo(() => {
    if (!query.trim() || activePill !== "empleados" || empleoTab !== "cvs") return [];
    const q = normalizeText(query);
    return empleados.filter((e) =>
      normalizeText(`${e.nombre} ${e.apellido}`).includes(q) ||
      normalizeText(e.habilidades.join(" ")).includes(q) ||
      normalizeText(e.barrio ?? "").includes(q) ||
      normalizeText(e.descripcion ?? "").includes(q)
    );
  }, [query, empleados, activePill, empleoTab]);

  const vacanteResults = useMemo(() => {
    if (!query.trim() || activePill !== "empleados" || empleoTab !== "vacantes") return [];
    const q = normalizeText(query);
    return vacantes.filter((v) =>
      normalizeText(v.titulo).includes(q) ||
      normalizeText(v.comercio.nombre).includes(q) ||
      normalizeText(v.habilidades.join(" ")).includes(q) ||
      normalizeText(v.barrio ?? "").includes(q) ||
      normalizeText(v.descripcion).includes(q)
    );
  }, [query, vacantes, activePill, empleoTab]);

  const totalResults = proResults.length + comercioResults.length + empleadoResults.length + vacanteResults.length;
  const showResults = query.trim().length > 0;

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const inputBg = isDark
    ? "bg-gray-900 border-gray-700 focus:border-gray-500"
    : "bg-white border-gray-300 focus:border-gray-400 shadow-sm";
  const labelColor = isDark ? "text-gray-400" : "text-gray-500";

  const pillColors: Record<Pill, { color: string; activeBg: string; activeBorder: string }> = {
    profesionales: { color: "text-gray-300", activeBg: isDark ? "bg-gray-700" : "bg-gray-900", activeBorder: isDark ? "border-gray-600" : "border-gray-700" },
    comercios: { color: isDark ? "text-amber-400" : "text-amber-700", activeBg: isDark ? "bg-amber-900/60" : "bg-amber-100", activeBorder: isDark ? "border-amber-700" : "border-amber-400" },
    oficios: { color: isDark ? "text-purple-400" : "text-purple-700", activeBg: isDark ? "bg-purple-900/60" : "bg-purple-100", activeBorder: isDark ? "border-purple-700" : "border-purple-400" },
    empleados: { color: isDark ? "text-emerald-400" : "text-emerald-700", activeBg: isDark ? "bg-emerald-900/60" : "bg-emerald-100", activeBorder: isDark ? "border-emerald-700" : "border-emerald-400" },
  };

  const placeholder =
    typeof PLACEHOLDERS[activePill] === "function"
      ? (PLACEHOLDERS[activePill] as (tab: EmpleoTab) => string)(empleoTab)
      : (PLACEHOLDERS[activePill] as string);

  return (
    <div className={`min-h-screen pb-40 md:pb-0 ${bg} transition-colors duration-300 flex flex-col`}>
      <Navbar totalReports={0} onMenuClick={() => {}} sidebarDisabled mapView="profesionales" />

      <div className="flex-1 flex flex-col">
        <div
          className="w-full transition-all duration-500 ease-in-out"
          style={{ paddingTop: showResults ? "4rem" : "calc(50vh - 210px)" }}
        >
          <div className="max-w-2xl mx-auto px-4">
            {/* Title */}
            <div
              className="transition-all duration-300 overflow-hidden"
              style={{ maxHeight: showResults ? "0" : "160px", opacity: showResults ? 0 : 1 }}
            >
              <p className={`text-xs font-semibold tracking-widest uppercase mb-3 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Reconquista · Santa Fe
              </p>
              <h1
                suppressHydrationWarning
                className="text-3xl sm:text-5xl font-black leading-tight mb-3 text-center"
                style={
                  isDark
                    ? { fontFamily: "var(--font-montserrat)", background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
                    : { fontFamily: "var(--font-montserrat)", color: "#111827" }
                }
              >
                Oficios, Comercios & Empleos
              </h1>
              <p className={`text-sm mb-5 text-center ${labelColor}`}>
                Encontra profesionales, comercios, oficios, CVs y vacantes.
              </p>
            </div>

            {/* Section pills */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {PILL_CONFIG.map(({ key, label }) => {
                const { color, activeBg, activeBorder } = pillColors[key];
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

            {/* Empleos sub-tabs */}
            {activePill === "empleados" && (
              <div className={`flex gap-1 p-1 rounded-xl mb-4 ${isDark ? "bg-gray-900 border border-gray-800" : "bg-gray-100 border border-gray-200"}`}>
                {(["cvs", "vacantes"] as EmpleoTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setEmpleoTab(tab); setQuery(""); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                      empleoTab === tab
                        ? isDark ? "bg-blue-600 text-white shadow" : "bg-white text-blue-700 shadow"
                        : isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab === "cvs" ? "Busco trabajo" : "Busco empleado"}
                  </button>
                ))}
              </div>
            )}

            {/* Search input */}
            <div className="relative mb-8">
              <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                style={{ color: isDark ? "#f9fafb" : "#111827", backgroundColor: isDark ? "#111827" : "#ffffff" }}
                className={`w-full pl-12 pr-10 py-4 rounded-2xl border text-sm focus:outline-none transition-colors placeholder:text-gray-400 ${inputBg}`}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search results */}
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
                    {proResults.map((pro, i) => (
                      <motion.div key={pro.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.03, ease: "easeOut" }}>
                        <ProfessionalResultCard pro={pro} dark={isDark} favIds={favIds} onToggleFav={handleToggleFav} />
                      </motion.div>
                    ))}
                    {comercioResults.map((c, i) => (
                      <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.03, ease: "easeOut" }}>
                        <StoreResultCard comercio={c} dark={isDark} />
                      </motion.div>
                    ))}
                    {empleadoResults.map((e, i) => (
                      <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.03, ease: "easeOut" }}>
                        <EmployeeResultCard empleado={e} dark={isDark} />
                      </motion.div>
                    ))}
                    {vacanteResults.map((v, i) => (
                      <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.03, ease: "easeOut" }}>
                        <VacancyResultCard vacante={v} dark={isDark} />
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Featured / discovery sections */}
            <div
              className="transition-all duration-300"
              style={{ opacity: showResults ? 0 : 1, pointerEvents: showResults ? "none" : "auto" }}
            >
              {!showResults && (
                <>
                  {activePill === "profesionales" && (
                    <>
                      <SectionHeader label="Profesionales destacados" linkHref="/profesional/nuevo" linkLabel="Registrarme" linkColor={isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} labelColor={labelColor} />
                      {professionalProfiles.length > 0 ? (
                        <InfiniteCarousel items={professionalProfiles.slice(0, 6)} renderCard={(p) => <FeaturedProfessionalCard pro={p} dark={isDark} />} />
                      ) : (
                        <EmptySection label="Aun no hay perfiles profesionales." labelColor={labelColor} />
                      )}
                    </>
                  )}

                  {activePill === "comercios" && (
                    <>
                      <SectionHeader label="Comercios destacados" linkHref="/comercio/nuevo" linkLabel="Registrar comercio" linkColor={isDark ? "text-amber-400 hover:text-amber-300" : "text-amber-600 hover:text-amber-700"} labelColor={labelColor} />
                      {comercios.length > 0 ? (
                        <InfiniteCarousel items={comercios} renderCard={(c) => <FeaturedStoreCard comercio={c} dark={isDark} />} />
                      ) : (
                        <EmptySection label="Aun no hay comercios." labelColor={labelColor} />
                      )}
                    </>
                  )}

                  {activePill === "oficios" && (
                    <>
                      <SectionHeader label="Explorar oficios" linkHref="/profesional/nuevo" linkLabel="Registrarme" linkColor={isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"} labelColor={labelColor} />
                      <JobCategoryGrid professionals={oficioProfiles} dark={isDark} onSelect={(o) => setQuery(o)} />
                    </>
                  )}

                  {activePill === "empleados" && empleoTab === "cvs" && (
                    <>
                      <SectionHeader label="CVs disponibles" linkHref="/empleo/nuevo" linkLabel="Subir mi CV" linkColor={isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} labelColor={labelColor} />
                      {empleados.filter((e) => e.disponible).length > 0 ? (
                        <InfiniteCarousel items={empleados.filter((e) => e.disponible)} renderCard={(e) => <FeaturedEmployeeCard empleado={e} dark={isDark} />} />
                      ) : (
                        <p className={`text-sm text-center py-8 ${labelColor}`}>
                          Aun no hay CVs publicados.{" "}
                          <Link href="/empleo/nuevo" className="text-blue-400 hover:underline">Publicar el tuyo</Link>
                        </p>
                      )}
                    </>
                  )}

                  {activePill === "empleados" && empleoTab === "vacantes" && (
                    <>
                      <SectionHeader label="Ultimas vacantes" linkHref="/vacante/nueva" linkLabel="Publicar vacante" linkColor={isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"} labelColor={labelColor} />
                      {vacantes.length > 0 ? (
                        <InfiniteCarousel items={vacantes} renderCard={(v) => <FeaturedVacancyCard vacante={v} dark={isDark} />} />
                      ) : (
                        <EmptySection label="Aun no hay vacantes publicadas." labelColor={labelColor} />
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

function SectionHeader({ label, linkHref, linkLabel, linkColor, labelColor }: {
  label: string; linkHref: string; linkLabel: string; linkColor: string; labelColor: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className={`text-sm font-medium ${labelColor}`}>{label}</p>
      <Link href={linkHref} className={`text-xs font-medium ${linkColor}`}>{linkLabel}</Link>
    </div>
  );
}

function EmptySection({ label, labelColor }: { label: string; labelColor: string }) {
  return <div className={`text-sm text-center py-8 ${labelColor}`}>{label}</div>;
}
