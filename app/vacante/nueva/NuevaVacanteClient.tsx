"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  CheckCircle,
  Briefcase,
  FileText,
  User,
  Building2,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useTheme } from "../../contexts/ThemeContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const BARRIOS = [
  "Centro",
  "Barrio Norte",
  "Barrio Sur",
  "Barrio Oeste",
  "Villa del Parque",
  "Las Lomas",
  "Parque Industrial",
  "Barrio Newbery",
  "Los Lapachos",
  "San Cayetano",
  "Otro",
];

const HABILIDADES_SUGERIDAS = [
  "Administración",
  "Atención al cliente",
  "Caja y cobranzas",
  "Cocina",
  "Contabilidad",
  "Diseño gráfico",
  "Electricidad",
  "Enfermería",
  "Gastronomía",
  "Informática",
  "Limpieza",
  "Logística",
  "Mantenimiento",
  "Marketing",
  "Mecánica",
  "Panadería",
  "Plomería",
  "Recepción",
  "Seguridad",
  "Ventas",
];

const MODALIDADES = [
  "Presencial",
  "A domicilio",
  "Part-time",
  "Full-time",
  "Por horas",
  "Temporal",
];

export default function NuevaVacanteClient() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingComercio, setCheckingComercio] = useState(true);
  const [hasComercio, setHasComercio] = useState(false);

  // Paso 1
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Paso 2
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [habilidadInput, setHabilidadInput] = useState("");
  const [barrio, setBarrio] = useState("");
  const [horario, setHorario] = useState("");
  const [salario, setSalario] = useState("");
  const [modalidad, setModalidad] = useState("");

  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setCheckingComercio(false);
      return;
    }
    async function checkComercio() {
      try {
        const token = await getToken();
        const res = await fetch(`${API}/api/comercios/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasComercio(res.ok);
      } catch {
        setHasComercio(false);
      } finally {
        setCheckingComercio(false);
      }
    }
    checkComercio();
  }, [isLoaded, isSignedIn, getToken]);

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const cardBg = isDark
    ? "bg-gray-900 border-gray-800"
    : "bg-white border-gray-200 shadow-sm";
  const inputClass = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500";
  const labelClass = isDark ? "text-gray-300" : "text-gray-700";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";

  function addHabilidad(h: string) {
    const clean = h.trim();
    if (!clean || habilidades.includes(clean)) return;
    setHabilidades((prev) => [...prev, clean]);
  }

  function removeHabilidad(h: string) {
    setHabilidades((prev) => prev.filter((x) => x !== h));
  }

  function handleHabilidadKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addHabilidad(habilidadInput);
      setHabilidadInput("");
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No autorizado");
      const res = await fetch(`${API}/api/vacantes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          habilidades,
          barrio: barrio || undefined,
          horario: horario.trim() || undefined,
          salario: salario.trim() || undefined,
          modalidad: modalidad || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al publicar");
      }
      const data = await res.json();
      setCreatedId(data.id);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded || checkingComercio) return null;

  if (!isSignedIn) {
    return (
      <div className={`min-h-screen ${bg} pb-24 md:pb-0`}>
        <Navbar
          totalReports={0}
          onMenuClick={() => {}}
          sidebarDisabled
          mapView="profesionales"
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] pt-16 px-6 text-center gap-6">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? "bg-emerald-900/40 border border-emerald-700" : "bg-emerald-50 border border-emerald-200"}`}
          >
            <User
              className={`w-8 h-8 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
            />
          </div>
          <div>
            <h1
              className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Inicia sesion para continuar
            </h1>
            <p className={`text-sm ${textSec}`}>
              Necesitas una cuenta de comercio para publicar vacantes.
            </p>
          </div>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors">
              Iniciar sesion
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (!hasComercio) {
    return (
      <div className={`min-h-screen ${bg} pb-24 md:pb-0`}>
        <Navbar
          totalReports={0}
          onMenuClick={() => {}}
          sidebarDisabled
          mapView="profesionales"
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] pt-16 px-6 text-center gap-6">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? "bg-amber-900/40 border border-amber-700" : "bg-amber-50 border border-amber-200"}`}
          >
            <Building2
              className={`w-8 h-8 ${isDark ? "text-amber-400" : "text-amber-600"}`}
            />
          </div>
          <div>
            <h1
              className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Necesitas un perfil de comercio
            </h1>
            <p className={`text-sm ${textSec} max-w-xs`}>
              Solo los comercios registrados pueden publicar vacantes. Primero
              crea tu perfil de comercio.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/comercio/nuevo"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors text-center"
            >
              Crear perfil de comercio
            </Link>
            <button
              onClick={() => router.push("/profesionales")}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Volver al buscador
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Paso 3 — exito
  if (step === 3 && createdId) {
    return (
      <div className={`min-h-screen ${bg} pb-24 md:pb-0`}>
        <Navbar
          totalReports={0}
          onMenuClick={() => {}}
          sidebarDisabled
          mapView="profesionales"
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] pt-16 px-6 text-center gap-6">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${isDark ? "bg-green-900/40 border border-green-700" : "bg-green-50 border border-green-200"}`}
          >
            <CheckCircle
              className={`w-10 h-10 ${isDark ? "text-green-400" : "text-green-600"}`}
            />
          </div>
          <div>
            <h1
              className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Vacante publicada
            </h1>
            <p className={`text-sm ${textSec}`}>
              Los candidatos ya pueden ver y postularse a tu vacante.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push(`/vacante/${createdId}`)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Ver vacante
            </button>
            <button
              onClick={() => router.push("/profesionales")}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Volver al buscador
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Descripcion", icon: FileText },
    { num: 2, label: "Detalles", icon: Briefcase },
  ];

  return (
    <div className={`min-h-screen ${bg} pb-24 md:pb-0`}>
      <Navbar
        totalReports={0}
        onMenuClick={() => {}}
        sidebarDisabled
        mapView="profesionales"
      />
      <div className="max-w-lg mx-auto px-4 py-8 mt-24">
        {/* Header */}
        <div className="mb-6">
          <h1
            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Publicar vacante
          </h1>
          <p className={`text-sm mt-1 ${textSec}`}>
            Contale a los candidatos que estas buscando.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const done = step > s.num;
            const active = step === s.num;
            return (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      done
                        ? "bg-emerald-600 border-emerald-600"
                        : active
                          ? isDark
                            ? "border-emerald-500 bg-emerald-900/30"
                            : "border-emerald-500 bg-emerald-50"
                          : isDark
                            ? "border-gray-700 bg-gray-900"
                            : "border-gray-300 bg-white"
                    }`}
                  >
                    {done ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Icon
                        className={`w-4 h-4 ${active ? (isDark ? "text-emerald-400" : "text-emerald-600") : isDark ? "text-gray-600" : "text-gray-400"}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium hidden sm:block ${active ? (isDark ? "text-emerald-400" : "text-emerald-600") : isDark ? "text-gray-600" : "text-gray-400"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${step > s.num ? "bg-emerald-600" : isDark ? "bg-gray-800" : "bg-gray-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className={`rounded-2xl border p-6 ${cardBg}`}>
          {/* Paso 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2
                  className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  La vacante
                </h2>
                <p className={`text-sm ${textSec}`}>
                  Describile a los candidatos que estas buscando.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${labelClass}`}>
                  Puesto / titulo *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Vendedor/a, Cocinero/a, Administrativo/a..."
                  maxLength={150}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${labelClass}`}>
                  Descripcion *
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripcion del puesto, tareas principales, requisitos, condiciones de trabajo..."
                  rows={5}
                  maxLength={1000}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors resize-none ${inputClass}`}
                />
                <p className={`text-xs text-right ${textSec}`}>
                  {descripcion.length}/1000
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!titulo.trim() || !descripcion.trim()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}

          {/* Paso 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2
                  className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Detalles
                </h2>
                <p className={`text-sm ${textSec}`}>
                  Cuanta mas info, mas facil encontrar al candidato ideal.
                </p>
              </div>

              {/* Habilidades */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${labelClass}`}>
                  Que buscamos (habilidades)
                </label>
                <div
                  className={`flex flex-wrap gap-2 p-3 rounded-xl border min-h-[48px] ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
                >
                  {habilidades.map((h) => (
                    <span
                      key={h}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}
                    >
                      {h}
                      <button
                        onClick={() => removeHabilidad(h)}
                        className="ml-0.5 opacity-60 hover:opacity-100"
                      >
                        <svg
                          className="w-3 h-3"
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
                    </span>
                  ))}
                  <input
                    type="text"
                    value={habilidadInput}
                    onChange={(e) => setHabilidadInput(e.target.value)}
                    onKeyDown={handleHabilidadKeyDown}
                    placeholder={
                      habilidades.length === 0
                        ? "Escribi una y Enter"
                        : "Agregar mas..."
                    }
                    className={`flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none ${isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {HABILIDADES_SUGERIDAS.filter((h) => !habilidades.includes(h))
                    .slice(0, 10)
                    .map((h) => (
                      <button
                        key={h}
                        onClick={() => addHabilidad(h)}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${isDark ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"}`}
                      >
                        + {h}
                      </button>
                    ))}
                </div>
              </div>

              {/* Barrio */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${labelClass}`}>
                  Barrio (opcional)
                </label>
                <select
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
                >
                  <option value="">Sin especificar</option>
                  {BARRIOS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Horario */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${labelClass}`}>
                  Horario (opcional)
                </label>
                <input
                  type="text"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  placeholder="Ej: Lunes a viernes 9 a 18hs"
                  maxLength={150}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
                />
              </div>

              {/* Salario */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${labelClass}`}>
                  Remuneracion (opcional)
                </label>
                <input
                  type="text"
                  value={salario}
                  onChange={(e) => setSalario(e.target.value)}
                  placeholder="Ej: A convenir, $500.000, Sueldo en blanco..."
                  maxLength={80}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
                />
              </div>

              {/* Modalidad */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${labelClass}`}>
                  Modalidad (opcional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {MODALIDADES.map((m) => (
                    <button
                      key={m}
                      onClick={() => setModalidad(modalidad === m ? "" : m)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        modalidad === m
                          ? isDark
                            ? "bg-emerald-900/50 text-emerald-300 border-emerald-700"
                            : "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : isDark
                            ? "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-700 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Atras
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  {loading ? "Publicando..." : "Publicar vacante"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
