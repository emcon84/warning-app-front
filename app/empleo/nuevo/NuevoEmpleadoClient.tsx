"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SignInButton, useUser } from "@clerk/nextjs";
import Navbar from "../../components/Navbar";
import { CheckCircle, User, Briefcase, MapPin } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import StepPersonal from "./components/StepPersonal";
import StepHabilidades from "./components/StepHabilidades";
import StepContacto from "./components/StepContacto";

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

      const res = await fetch(`/api/empleados`, {
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
      <div className={`min-h-screen ${bg} pb-40 md:pb-0`}>
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
      <div className={`min-h-screen ${bg} pb-40 md:pb-0`}>
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
              onClick={() => router.push(`/empleo/${createdSlug}`)}
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
    <div className={`min-h-screen ${bg} pb-40 md:pb-0`}>
      <Navbar
        totalReports={0}
        onMenuClick={() => {}}
        sidebarDisabled
        mapView="profesionales"
      />
      <div className="max-w-lg mx-auto px-4 py-8 mt-24">
        {/* Stepper */}
        <div className="flex items-center mb-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const done = step > s.num;
            const active = step === s.num;
            return (
              <Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
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
              </Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className={`rounded-2xl border p-6 ${cardBg}`}>
          {step === 1 && (
            <StepPersonal
              nombre={nombre}
              apellido={apellido}
              fotoPreview={fotoPreview}
              isDark={isDark}
              inputClass={inputClass}
              labelClass={labelClass}
              textSec={textSec}
              onNombre={setNombre}
              onApellido={setApellido}
              onFotoChange={handleFotoChange}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepHabilidades
              habilidades={habilidades}
              habilidadInput={habilidadInput}
              descripcion={descripcion}
              isDark={isDark}
              inputClass={inputClass}
              labelClass={labelClass}
              textSec={textSec}
              onHabilidadInputChange={setHabilidadInput}
              onHabilidadKeyDown={handleHabilidadKeyDown}
              onAddHabilidad={addHabilidad}
              onRemoveHabilidad={removeHabilidad}
              onDescripcion={setDescripcion}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepContacto
              barrio={barrio}
              whatsapp={whatsapp}
              disponible={disponible}
              error={error}
              loading={loading}
              isDark={isDark}
              inputClass={inputClass}
              labelClass={labelClass}
              textSec={textSec}
              onBarrio={setBarrio}
              onWhatsapp={setWhatsapp}
              onToggleDisponible={() => setDisponible((v) => !v)}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
