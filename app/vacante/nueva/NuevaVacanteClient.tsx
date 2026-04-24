"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  CheckCircle2,
  Briefcase,
  ListChecks,
  User,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import { useConfetti } from "../../hooks/useConfetti";
import { useTheme } from "../../contexts/ThemeContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";


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

const TOTAL_STEPS = 2;

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const iconVariants = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { delay: 0.1, duration: 0.3 } },
};

const INPUT_CLS =
  "w-full px-4 py-3.5 rounded-2xl bg-gray-900 border border-gray-800 text-white placeholder-gray-600 text-base focus:outline-none focus:border-indigo-500 transition-colors";

export default function NuevaVacanteClient() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  const { isDark } = useTheme();

  const { fire: fireConfetti } = useConfetti();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingComercio, setCheckingComercio] = useState(true);
  const [hasComercio, setHasComercio] = useState(false);

  // Paso 0
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Paso 1
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [habilidadInput, setHabilidadInput] = useState("");
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

  function goNext() {
    setDirection(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step === 0) {
      router.back();
      return;
    }
    setDirection(-1);
    setStep((s) => s - 1);
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
      fireConfetti();
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  // ---------- Guards ----------
  if (!isLoaded || checkingComercio) return null;

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";

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
      <div className={`min-h-screen ${bg} pb-40 md:pb-0`}>
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

  // ---------- Step 2 — Exito ----------
  if (step === 2 && createdId) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 text-center gap-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-28 h-28 rounded-full bg-green-500/20 flex items-center justify-center"
        >
          <CheckCircle2 className="w-14 h-14 text-green-400" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-3xl font-bold text-white">Publicado!</h1>
          <p className="text-gray-400">Tu busqueda ya esta visible</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.3 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <motion.button
            onClick={() => router.push(`/vacante/${createdId}`)}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-base transition-colors"
          >
            Ver la publicacion
          </motion.button>
          <button
            onClick={() => router.push("/profesionales")}
            className="w-full py-3 text-sm text-gray-500 hover:text-white transition-colors"
          >
            Volver al buscador
          </button>
        </motion.div>
      </div>
    );
  }

  // ---------- Wizard steps ----------
  const stepDefs = [
    {
      icon: <Briefcase className="w-8 h-8 text-blue-400" />,
      iconBg: "bg-blue-500/20",
      title: "¿Qué puesto buscas?",
      subtitle: "Describilo con claridad para atraer buenos candidatos",
      content: (
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-xs mb-1.5 block text-gray-400">
              Título del puesto
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Vendedor/a, Cocinero/a, Administrativo/a..."
              maxLength={150}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 flex items-center justify-between text-gray-400">
              <span>Descripción</span>
              <span className="text-gray-600">{descripcion.length}/1000</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del puesto, tareas principales, requisitos, condiciones de trabajo..."
              rows={6}
              maxLength={1000}
              className="w-full px-4 py-3.5 rounded-2xl bg-gray-900 border border-gray-800 text-white placeholder-gray-600 text-base focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>
        </div>
      ),
      canContinue: titulo.trim().length > 0 && descripcion.trim().length > 0,
      onContinue: goNext,
    },
    {
      icon: <ListChecks className="w-8 h-8 text-orange-400" />,
      iconBg: "bg-orange-500/20",
      title: "Un poco más...",
      subtitle: "Todo esto es opcional pero ayuda a filtrar candidatos",
      content: (
        <div className="flex flex-col gap-5">
          {/* Habilidades */}
          <div>
            <label className="text-xs mb-1.5 block text-gray-400">
              Habilidades buscadas
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={habilidadInput}
                onChange={(e) => setHabilidadInput(e.target.value)}
                onKeyDown={handleHabilidadKeyDown}
                placeholder="Escribí una y Enter"
                className="flex-1 px-4 py-3 rounded-2xl bg-gray-900 border border-gray-800 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={() => {
                  addHabilidad(habilidadInput);
                  setHabilidadInput("");
                }}
                className="px-4 py-3 rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 text-sm hover:border-gray-600 transition-colors"
              >
                +
              </button>
            </div>

            {habilidades.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {habilidades.map((h) => (
                  <span
                    key={h}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm bg-indigo-500/10 border-indigo-500 text-indigo-300"
                  >
                    {h}
                    <button
                      onClick={() => removeHabilidad(h)}
                      className="hover:opacity-70"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {HABILIDADES_SUGERIDAS.filter((h) => !habilidades.includes(h))
                .slice(0, 10)
                .map((h) => (
                  <button
                    key={h}
                    onClick={() => addHabilidad(h)}
                    className="px-3 py-1.5 rounded-full text-xs border border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600 transition-colors"
                  >
                    + {h}
                  </button>
                ))}
            </div>
          </div>

          {/* Horario */}
          <div>
            <label className="text-xs mb-1.5 block text-gray-400">
              Horario (opcional)
            </label>
            <input
              type="text"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              placeholder="Ej: Lunes a viernes 9 a 18hs"
              maxLength={150}
              className={INPUT_CLS}
            />
          </div>

          {/* Salario */}
          <div>
            <label className="text-xs mb-1.5 block text-gray-400">
              Remuneración (opcional)
            </label>
            <input
              type="text"
              value={salario}
              onChange={(e) => setSalario(e.target.value)}
              placeholder="Ej: A convenir, $500.000, Sueldo en blanco..."
              maxLength={80}
              className={INPUT_CLS}
            />
          </div>

          {/* Modalidad */}
          <div>
            <label className="text-xs mb-1.5 block text-gray-400">
              Modalidad (opcional)
            </label>
            <div className="flex flex-wrap gap-2">
              {MODALIDADES.map((m) => (
                <button
                  key={m}
                  onClick={() => setModalidad(modalidad === m ? "" : m)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    modalidad === m
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-300"
                      : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-2xl bg-red-900/30 border border-red-800 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      ),
      canContinue: !loading,
      onContinue: handleSubmit,
      ctaLabel: loading ? "Publicando..." : "Publicar vacante",
    },
  ];

  const currentStep = stepDefs[step];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header fijo */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-gray-950/90 backdrop-blur-sm px-4 pt-safe">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={goBack}
              className="w-10 h-10 flex items-center justify-center rounded-2xl text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500">
              paso {step + 1}/{TOTAL_STEPS}
            </span>
            <div className="w-10" />
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-800 rounded-full mb-2">
            <motion.div
              className="h-1 bg-indigo-500 rounded-full"
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 flex flex-col pt-[88px] pb-32">
        <div className="max-w-lg mx-auto w-full px-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="flex flex-col"
            >
              {/* Icono del step */}
              <div className="flex justify-center mt-8 mb-8">
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                  className={`w-24 h-24 rounded-full ${currentStep.iconBg} flex items-center justify-center`}
                >
                  {currentStep.icon}
                </motion.div>
              </div>

              {/* Titulo y subtitulo */}
              <h1 className="text-2xl font-bold text-white text-center mb-2">
                {currentStep.title}
              </h1>
              <p className="text-gray-400 text-center mb-8">
                {currentStep.subtitle}
              </p>

              {/* Contenido del step */}
              {currentStep.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom button fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-sm px-4 pb-safe">
        <div className="max-w-lg mx-auto py-4">
          <motion.button
            onClick={currentStep.onContinue}
            disabled={!currentStep.canContinue}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {("ctaLabel" in currentStep && currentStep.ctaLabel) || "Continuar"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
