"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Wrench,
  FileText,
  Bell,
  ArrowLeft,
  Sparkles,
  Check,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useConfetti } from "../../hooks/useConfetti";
import { useTheme } from "../../contexts/ThemeContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const OFICIOS_SUGERIDOS = [
  "Plomero",
  "Electricista",
  "Albañil",
  "Pintor",
  "Gasista",
  "Jardinero",
  "Herrero",
  "Carpintero",
  "Climatización",
  "Cerrajero",
  "Techista",
  "Soldador",
  "Fumigador",
  "Limpieza",
  "Flete",
  "Mecánico",
  "Yesero",
  "Instalador",
];

const PROFESIONES_SUGERIDAS = [
  "Desarrollador de software",
  "Contador",
  "Abogado",
  "Arquitecto",
  "Ingeniero",
  "Diseñador gráfico",
  "Marketing digital",
  "Administración",
  "Docente",
  "Psicólogo",
  "Community manager",
  "Analista de datos",
  "Traductor",
  "Consultor",
  "Escribano",
];

const TOTAL_STEPS = 4;

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const iconVariants = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { delay: 0.1, duration: 0.3 } },
};

// INPUT_CLS se genera dinámicamente dentro del componente según el tema

// ---------- Step 4 — Notificaciones ----------
function Step4Notificaciones({
  permission,
  isSupported,
  requestPermission,
  onFinish,
}: {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  onFinish: () => void;
}) {
  const [activating, setActivating] = useState(false);
  const [status, setStatus] = useState<"idle" | "denied" | "error">("idle");
  const { isDark } = useTheme();
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";

  useEffect(() => {
    if (permission === "granted") {
      const t = setTimeout(onFinish, 1200);
      return () => clearTimeout(t);
    }
  }, [permission, onFinish]);

  async function handleActivar() {
    setActivating(true);
    setStatus("idle");
    try {
      const success = await requestPermission();
      if (!success) {
        setStatus("denied");
        setTimeout(onFinish, 2000);
      }
    } catch (error) {
      console.error("Error al activar notificaciones:", error);
      setStatus("error");
      setTimeout(onFinish, 2000);
    } finally {
      setActivating(false);
    }
  }

  if (permission === "granted") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center"
        >
          <Check className="w-12 h-12 text-green-400" />
        </motion.div>
        <p className={`font-bold text-xl ${textPri}`}>Notificaciones activadas</p>
        <p className={`text-sm text-center ${textSec}`}>
          Te vamos a avisar cuando un cliente te contacte.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {!isSupported && (
        <p className={`text-xs text-center ${textSec}`}>
          Tu navegador no soporta notificaciones push. Podrás activarlas después
          desde tu perfil.
        </p>
      )}

      {status === "denied" && (
        <div className="text-center p-4 rounded-2xl bg-yellow-900/30 border border-yellow-800">
          <p className="text-sm text-yellow-400">
            Las notificaciones fueron denegadas. Podrás activarlas luego desde
            tu perfil.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center p-4 rounded-2xl bg-red-900/30 border border-red-800">
          <p className="text-sm text-red-400">
            Hubo un error al activar las notificaciones. Podrás intentarlo luego
            desde tu perfil.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {isSupported && (
          <motion.button
            onClick={handleActivar}
            disabled={activating}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {activating ? "Activando..." : "Activar notificaciones"}
          </motion.button>
        )}
        <button
          onClick={onFinish}
          className={`w-full py-2 text-sm ${textSec} transition-colors`}
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}

// ---------- Main component ----------
export default function NuevoProfesionalClient() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { permission, isSupported, requestPermission } = useNotifications();
  const { isDark } = useTheme();

  const pageBg    = isDark ? "bg-gray-950"  : "bg-gray-50";
  const headerBg  = isDark ? "bg-gray-950/90" : "bg-gray-50/90";
  const cardBg    = isDark ? "bg-gray-900"  : "bg-white";
  const border    = isDark ? "border-gray-800" : "border-gray-200";
  const textPri   = isDark ? "text-white"   : "text-gray-900";
  const textSec   = isDark ? "text-gray-400": "text-gray-500";
  const textMut   = isDark ? "text-gray-600": "text-gray-400";
  const inputCls  = isDark
    ? "bg-gray-900 border-gray-800 text-white placeholder-gray-600 focus:border-indigo-500"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500";
  const chipBase  = isDark
    ? "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600"
    : "bg-gray-100 border-gray-200 text-gray-600 hover:border-gray-400";
  const chipSel   = "bg-indigo-500/10 border-indigo-500 text-indigo-400";

  const INPUT_CLS = `w-full px-4 py-3.5 rounded-2xl ${inputCls} text-base focus:outline-none transition-colors`;

  const { fire: fireConfetti } = useConfetti();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    whatsapp: "",
    tipo: "" as "oficio" | "profesion" | "",
    oficios: [] as string[],
    oficioCustom: "",
    descripcion: "",
    experiencia: "",
  });

  const [whatsappRaw, setWhatsappRaw] = useState("");
  const [aiForm, setAiForm] = useState({ anios: "", zona: "" });
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

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

  function handleWhatsappChange(raw: string) {
    setWhatsappRaw(raw);
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setForm((f) => ({ ...f, whatsapp: "" }));
      return;
    }
    let formatted = digits;
    if (digits.startsWith("549")) {
      formatted = digits;
    } else if (digits.startsWith("54")) {
      formatted = "549" + digits.slice(2);
    } else if (digits.startsWith("0")) {
      formatted = "549" + digits.slice(1);
    } else {
      formatted = "549" + digits;
    }
    setForm((f) => ({ ...f, whatsapp: formatted }));
  }

  async function handleGenerarDescripcion() {
    setAiLoading(true);
    try {
      const token = await getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API}/api/ai/generate-description`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          oficios: form.oficios,
          nombre: form.nombre,
          anios: aiForm.anios || undefined,
          zona: aiForm.zona || undefined,
        }),
      });
      if (!res.ok) throw new Error("Error generando descripcion");
      const data = await res.json();
      setForm((f) => ({ ...f, descripcion: data.descripcion }));
      setAiOpen(false);
    } catch {
      // silently fail — user can write manually
    } finally {
      setAiLoading(false);
    }
  }

  function toggleOficio(oficio: string) {
    setForm((f) => ({
      ...f,
      oficios: f.oficios.includes(oficio)
        ? f.oficios.filter((o) => o !== oficio)
        : f.oficios.length < 3
          ? [...f.oficios, oficio]
          : f.oficios,
    }));
  }

  function addCustomOficio() {
    const val = form.oficioCustom.trim();
    if (!val || form.oficios.includes(val) || form.oficios.length >= 3) return;
    setForm((f) => ({ ...f, oficios: [...f.oficios, val], oficioCustom: "" }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const descripcionFinal = [
        form.descripcion,
        form.experiencia ? `\n\nExperiencia: ${form.experiencia}` : "",
      ]
        .join("")
        .trim();

      const token = await getToken();
      const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (token) authHeaders["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/professionals`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono,
          whatsapp: form.whatsapp,
          tipo: form.tipo || "oficio",
          oficios: form.oficios.map((o) => o.toLowerCase()),
          descripcion: descripcionFinal,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear perfil");
      }

      const pro = await res.json();
      setCreatedSlug(pro.slug);
      fireConfetti();
      goNext();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const onFinish = useCallback(
    () => router.push(`/profesional/${createdSlug}`),
    [router, createdSlug],
  );

  const canGoStep1 = form.nombre && form.apellido && form.whatsapp.length >= 6;
  const canGoStep2 = form.tipo !== "" && form.oficios.length > 0;
  const canSubmit = form.descripcion.length >= 30;
  const categoriasSugeridas =
    form.tipo === "oficio" ? OFICIOS_SUGERIDOS : PROFESIONES_SUGERIDAS;
  const tipoLabel = form.tipo === "profesion" ? "profesión" : "oficio";
  const tipoLabelPlural = form.tipo === "profesion" ? "profesiones" : "oficios";

  // ---------- Step content ----------
  const steps = [
    {
      // Step 0 — Datos
      icon: <User className="w-8 h-8 text-indigo-400" />,
      iconBg: "bg-indigo-500/20",
      title: "¿Cómo te llamás?",
      subtitle: "Así te van a ver tus clientes",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={`text-xs mb-1.5 block ${textSec}`}>Nombre</label>
              <input
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Juan"
                className={INPUT_CLS}
              />
            </div>
            <div className="flex-1">
              <label className={`text-xs mb-1.5 block ${textSec}`}>Apellido</label>
              <input
                value={form.apellido}
                onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))}
                placeholder="Garcia"
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs mb-1.5 block ${textSec}`}>
              WhatsApp
            </label>
            <input
              value={whatsappRaw}
              onChange={(e) => handleWhatsappChange(e.target.value)}
              placeholder="3482 123456"
              inputMode="numeric"
              className={INPUT_CLS}
            />
            {form.whatsapp.length >= 6 && (
              <p className="text-xs mt-1.5 text-green-400">
                Listo: wa.me/{form.whatsapp}
              </p>
            )}
            {whatsappRaw && form.whatsapp.length < 6 && (
              <p className="text-xs mt-1.5 text-yellow-500">
                Número incompleto.
              </p>
            )}
          </div>

          <div>
            <label className={`text-xs mb-1.5 block ${textSec}`}>
              Teléfono{" "}
              <span className={textMut}>(opcional)</span>
            </label>
            <input
              value={form.telefono}
              onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              placeholder="03482-XXXXXX"
              type="tel"
              inputMode="numeric"
              className={INPUT_CLS}
            />
            <p className={`text-xs mt-1 ${textMut}`}>
              Solo se comparte cuando acordas con un cliente.
            </p>
          </div>
        </div>
      ),
      canContinue: canGoStep1,
      onContinue: goNext,
    },
    {
      // Step 1 — Especialidad
      icon: <Wrench className="w-8 h-8 text-amber-400" />,
      iconBg: "bg-amber-500/20",
      title: "¿Cuál es tu oficio?",
      subtitle: "Podés agregar hasta 3",
      content: (
        <div className="flex flex-col gap-5">
          {/* Toggle tipo */}
          <div className="flex gap-2">
            {(["oficio", "profesion"] as const).map((t) => (
              <button
                key={t}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    tipo: t,
                    oficios: [],
                    oficioCustom: "",
                  }))
                }
                className={`flex-1 px-3 py-2.5 rounded-2xl text-sm font-semibold border transition-all ${
                  form.tipo === t
                    ? "bg-indigo-500 border-indigo-500 text-white"
                    : chipBase
                }`}
              >
                {t === "oficio" ? "Oficio" : "Profesión"}
              </button>
            ))}
          </div>

          {form.tipo === "" && (
            <p className={`text-sm text-center py-4 ${textMut}`}>
              Seleccioná una opción para continuar.
            </p>
          )}

          {form.tipo !== "" && (
            <>
              <p className={`text-sm ${textSec}`}>
                Elegí hasta 3 {tipoLabelPlural}.
              </p>

              <div className="flex flex-wrap gap-2">
                {categoriasSugeridas.map((o) => (
                  <button
                    key={o}
                    onClick={() => toggleOficio(o)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all cursor-pointer ${
                      form.oficios.includes(o) ? chipSel : chipBase
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={form.oficioCustom}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, oficioCustom: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && addCustomOficio()}
                  placeholder={`Otra ${tipoLabel}... (Enter)`}
                  className={`flex-1 px-4 py-3 rounded-2xl border ${inputCls} text-sm focus:outline-none transition-colors`}
                />
                <button
                  onClick={addCustomOficio}
                  className={`px-4 py-3 rounded-2xl border ${chipBase} text-sm transition-colors`}
                >
                  Agregar
                </button>
              </div>

              {form.oficios.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.oficios.map((o) => (
                    <span
                      key={o}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm ${chipSel}`}
                    >
                      {o}
                      <button
                        onClick={() => toggleOficio(o)}
                        className="hover:opacity-70"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ),
      canContinue: canGoStep2,
      onContinue: goNext,
    },
    {
      // Step 2 — Perfil
      icon: <FileText className="w-8 h-8 text-emerald-400" />,
      iconBg: "bg-emerald-500/20",
      title: "Contanos sobre vos",
      subtitle: "Esto es lo primero que van a leer tus clientes",
      content: (
        <div className="flex flex-col gap-4">
          <div>
            <label className={`text-xs mb-1.5 flex items-center justify-between ${textSec}`}>
              <span>Descripción</span>
              <span className={textMut}>
                {form.descripcion.length}/500, mínimo 30
              </span>
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  descripcion: e.target.value.slice(0, 500),
                }))
              }
              placeholder="Contá qué hacés, cómo trabajás, en qué zonas atendés."
              rows={5}
              className={`w-full px-4 py-3.5 rounded-2xl border ${inputCls} text-base focus:outline-none transition-colors resize-none`}
            />
            {form.descripcion.length > 0 && form.descripcion.length < 30 && (
              <p className="text-xs text-yellow-500 mt-1">
                Faltan {30 - form.descripcion.length} caracteres más.
              </p>
            )}

            {/* Botón Generar con IA */}
            {!aiOpen ? (
              <button
                type="button"
                onClick={() => setAiOpen(true)}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-2xl border border-indigo-800 text-indigo-400 hover:bg-indigo-900/30 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Generar con IA
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-4 rounded-2xl border border-indigo-800 bg-indigo-950/30"
              >
                <p className="text-xs font-medium mb-3 text-indigo-300">
                  Dos preguntas rápidas y la IA escribe el borrador
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    value={aiForm.anios}
                    onChange={(e) =>
                      setAiForm((f) => ({ ...f, anios: e.target.value }))
                    }
                    placeholder="Años de experiencia (ej: 10)"
                    inputMode="numeric"
                    className={`w-full px-4 py-3 rounded-2xl border ${inputCls} text-sm focus:outline-none transition-colors`}
                  />
                  <input
                    value={aiForm.zona}
                    onChange={(e) =>
                      setAiForm((f) => ({ ...f, zona: e.target.value }))
                    }
                    placeholder="Zonas donde trabajás (ej: Centro, Barrio Norte)"
                    className={`w-full px-4 py-3 rounded-2xl border ${inputCls} text-sm focus:outline-none transition-colors`}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleGenerarDescripcion}
                    disabled={aiLoading}
                    className="flex-1 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {aiLoading ? "Generando..." : "Generar descripción"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiOpen(false)}
                    className={`px-4 py-2.5 rounded-2xl text-xs border ${border} ${textSec} hover:border-gray-600 transition-colors`}
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div>
            <label className={`text-xs mb-1.5 block ${textSec}`}>
              Experiencia{" "}
              <span className={textMut}>(opcional)</span>
            </label>
            <textarea
              value={form.experiencia}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  experiencia: e.target.value.slice(0, 300),
                }))
              }
              placeholder="Ej: 10 años trabajando en Reconquista. Hice la instalación eléctrica del Colegio X..."
              rows={3}
              className={`w-full px-4 py-3.5 rounded-2xl border ${inputCls} text-base focus:outline-none transition-colors resize-none`}
            />
          </div>

          {error && (
            <p className="text-sm border rounded-2xl px-4 py-3 text-red-400 bg-red-900/20 border-red-800">
              {error}
            </p>
          )}
        </div>
      ),
      canContinue: canSubmit && !loading,
      onContinue: handleSubmit,
      ctaLabel: loading ? "Creando perfil..." : "Publicar perfil",
    },
    {
      // Step 3 — Notificaciones
      icon: <Bell className="w-8 h-8 text-violet-400" />,
      iconBg: "bg-violet-500/20",
      title: "Activá las notificaciones",
      subtitle: "Avisamos cuando un cliente quiere contactarte",
      content: (
        <Step4Notificaciones
          permission={permission}
          isSupported={isSupported}
          requestPermission={requestPermission}
          onFinish={onFinish}
        />
      ),
      canContinue: false, // manejado internamente por el step
      onContinue: onFinish,
      hideButton: true,
    },
  ];

  const currentStep = steps[step];

  return (
    <div className={`min-h-screen ${pageBg} ${textPri} flex flex-col`}>
      {/* Header fijo */}
      <div className={`fixed top-0 left-0 right-0 z-10 ${headerBg} backdrop-blur-sm px-4 pt-safe`}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={goBack}
              className={`w-10 h-10 flex items-center justify-center rounded-2xl ${textSec} transition-colors`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className={`text-sm ${textSec}`}>
              paso {step + 1}/{TOTAL_STEPS}
            </span>
            <div className="w-10" />
          </div>

          {/* Progress bar */}
          <div className={`h-1 ${isDark ? "bg-gray-800" : "bg-gray-200"} rounded-full mb-2`}>
            <motion.div
              className="h-1 bg-indigo-500 rounded-full"
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Contenido con scroll */}
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
              <h1 className={`text-2xl font-bold ${textPri} text-center mb-2`}>
                {currentStep.title}
              </h1>
              <p className={`${textSec} text-center mb-8`}>
                {currentStep.subtitle}
              </p>

              {/* Contenido del step */}
              {currentStep.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom button fijo */}
      {!currentStep.hideButton && (
        <div className={`fixed bottom-0 left-0 right-0 ${headerBg} backdrop-blur-sm px-4 pb-safe`}>
          <div className="max-w-lg mx-auto py-4">
            <motion.button
              onClick={currentStep.onContinue}
              disabled={!currentStep.canContinue}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {currentStep.ctaLabel ?? "Continuar"}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
