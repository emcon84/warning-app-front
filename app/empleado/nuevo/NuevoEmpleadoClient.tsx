"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SignInButton, useUser } from "@clerk/nextjs";
import Navbar from "../../components/Navbar";
import { CheckCircle, User, Briefcase, MapPin } from "lucide-react";
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

export default function NuevoEmpleadoClient() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paso 1
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  // Paso 2
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [habilidadInput, setHabilidadInput] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Paso 3
  const [barrio, setBarrio] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [disponible, setDisponible] = useState(true);

  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const cardBg = isDark
    ? "bg-gray-900 border-gray-800"
    : "bg-white border-gray-200 shadow-sm";
  const inputClass = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500";
  const labelClass = isDark ? "text-gray-300" : "text-gray-700";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  }

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
      const fd = new FormData();
      fd.append("nombre", nombre.trim());
      fd.append("apellido", apellido.trim());
      fd.append("habilidades", habilidades.join(","));
      if (descripcion.trim()) fd.append("descripcion", descripcion.trim());
      if (barrio) fd.append("barrio", barrio);
      if (whatsapp.trim()) fd.append("whatsapp", whatsapp.trim());
      fd.append("disponible", String(disponible));
      if (foto) fd.append("photo", foto);

      const res = await fetch(`${API}/api/empleados`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear perfil");
      }
      const data = await res.json();
      setCreatedSlug(data.slug);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) return null;

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
            className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? "bg-blue-900/40 border border-blue-700" : "bg-blue-50 border border-blue-200"}`}
          >
            <User
              className={`w-8 h-8 ${isDark ? "text-blue-400" : "text-blue-600"}`}
            />
          </div>
          <div>
            <h1
              className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Inicia sesion para continuar
            </h1>
            <p className={`text-sm ${textSec}`}>
              Necesitas una cuenta para subir tu CV.
            </p>
          </div>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
              Iniciar sesion
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // Paso 4 — exito
  if (step === 4 && createdSlug) {
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
              Perfil publicado
            </h1>
            <p className={`text-sm ${textSec}`}>
              Tu perfil ya es visible para empleadores en Reconquista.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push(`/empleado/${createdSlug}`)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Ver mi perfil
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
    { num: 1, label: "Datos personales", icon: User },
    { num: 2, label: "Habilidades", icon: Briefcase },
    { num: 3, label: "Contacto", icon: MapPin },
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
                        ? "bg-blue-600 border-blue-600"
                        : active
                          ? isDark
                            ? "border-blue-500 bg-blue-900/30"
                            : "border-blue-500 bg-blue-50"
                          : isDark
                            ? "border-gray-700 bg-gray-900"
                            : "border-gray-300 bg-white"
                    }`}
                  >
                    {done ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Icon
                        className={`w-4 h-4 ${active ? (isDark ? "text-blue-400" : "text-blue-600") : isDark ? "text-gray-600" : "text-gray-400"}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium hidden sm:block ${active ? (isDark ? "text-blue-400" : "text-blue-600") : isDark ? "text-gray-600" : "text-gray-400"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${step > s.num ? "bg-blue-600" : isDark ? "bg-gray-800" : "bg-gray-200"}`}
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
                  Datos personales
                </h2>
                <p className={`text-sm ${textSec}`}>
                  Como te conoceran los empleadores.
                </p>
              </div>

              {/* Foto */}
              <div className="flex flex-col items-center gap-3">
                <label className="cursor-pointer group">
                  <div
                    className={`w-24 h-24 rounded-full overflow-hidden border-2 transition-all ${isDark ? "border-gray-700 group-hover:border-blue-500" : "border-gray-200 group-hover:border-blue-400"}`}
                  >
                    {fotoPreview ? (
                      <img
                        src={fotoPreview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                      >
                        <User
                          className={`w-10 h-10 ${isDark ? "text-gray-600" : "text-gray-400"}`}
                        />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                </label>
                <p className={`text-xs ${textSec}`}>
                  Toca para agregar foto (opcional)
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${labelClass}`}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${labelClass}`}>
                  Apellido *
                </label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Tu apellido"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!nombre.trim() || !apellido.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
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
                  Tus habilidades
                </h2>
                <p className={`text-sm ${textSec}`}>
                  Agrega los rubros en los que tenes experiencia.
                </p>
              </div>

              {/* Input de habilidades */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${labelClass}`}>
                  Habilidades / rubros *
                </label>
                <div
                  className={`flex flex-wrap gap-2 p-3 rounded-xl border min-h-[48px] ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
                >
                  {habilidades.map((h) => (
                    <span
                      key={h}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? "bg-blue-900/50 text-blue-300 border border-blue-700" : "bg-blue-50 text-blue-700 border border-blue-200"}`}
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
                        ? "Escribi una habilidad y Enter"
                        : "Agregar mas..."
                    }
                    className={`flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none ${isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
                  />
                </div>
              </div>

              {/* Sugerencias */}
              <div>
                <p className={`text-xs mb-2 ${textSec}`}>Sugerencias:</p>
                <div className="flex flex-wrap gap-2">
                  {HABILIDADES_SUGERIDAS.filter(
                    (h) => !habilidades.includes(h),
                  ).map((h) => (
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

              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${labelClass}`}>
                  Descripcion breve (opcional)
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Contale a los empleadores un poco sobre vos, tu experiencia, que buscas..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors resize-none ${inputClass}`}
                />
                <p className={`text-xs text-right ${textSec}`}>
                  {descripcion.length}/500
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Atras
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={habilidades.length === 0}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Paso 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2
                  className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Contacto y disponibilidad
                </h2>
                <p className={`text-sm ${textSec}`}>
                  Como te van a contactar los interesados.
                </p>
              </div>

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

              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${labelClass}`}>
                  WhatsApp (opcional)
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej: 3482123456"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
                />
                <p className={`text-xs ${textSec}`}>
                  Solo se muestra si el interesado no recibe respuesta por chat.
                </p>
              </div>

              {/* Toggle disponible */}
              <div
                className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}
              >
                <div>
                  <p
                    className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Disponible para trabajar
                  </p>
                  <p className={`text-xs ${textSec}`}>
                    Los empleadores ven tu estado en el buscador.
                  </p>
                </div>
                <button
                  onClick={() => setDisponible((v) => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${disponible ? "bg-blue-600" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${disponible ? "translate-x-6" : "translate-x-0"}`}
                  />
                </button>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-700 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Atras
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  {loading ? "Publicando..." : "Publicar perfil"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
