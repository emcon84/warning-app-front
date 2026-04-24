"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  MapPin,
  Camera,
  Bell,
  ArrowLeft,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useConfetti } from "../../hooks/useConfetti";
import { useTheme } from "../../contexts/ThemeContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const RUBROS = [
  "Almacén/Despensa",
  "Restaurante/Comida",
  "Indumentaria",
  "Calzado",
  "Electrónica",
  "Tecnología/Informática",
  "Ferretería",
  "Materiales/Construcción",
  "Farmacia",
  "Salud/Bienestar",
  "Peluquería/Estética",
  "Librería/Papelería",
  "Veterinaria",
  "Deportes",
  "Mueblería",
  "Joyería/Relojería",
  "Automotriz/Mecánica",
  "Inmobiliaria",
  "Seguros/Finanzas",
  "Educación/Clases",
  "Fotografía/Arte",
  "Contaduría/Administración",
  "Agro/Cerealista",
  "Otro",
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

// ─── Step 4: Notificaciones ──────────────────────────────────────────────────

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
    } catch {
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
          Te vamos a avisar cuando un cliente te consulte.
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
            Las notificaciones fueron denegadas. Podrás activarlas luego desde tu perfil.
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="text-center p-4 rounded-2xl bg-red-900/30 border border-red-800">
          <p className="text-sm text-red-400">
            Hubo un error al activar las notificaciones. Podrás intentarlo luego desde tu perfil.
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

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NuevoComercioClient() {
  const router = useRouter();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { permission, isSupported, requestPermission } = useNotifications();
  const { fire: fireConfetti } = useConfetti();
  const { isDark } = useTheme();

  const pageBg   = isDark ? "bg-gray-950"  : "bg-gray-50";
  const headerBg = isDark ? "bg-gray-950/90" : "bg-gray-50/90";
  const cardBg   = isDark ? "bg-gray-900"  : "bg-white";
  const border   = isDark ? "border-gray-800" : "border-gray-200";
  const textPri  = isDark ? "text-white"   : "text-gray-900";
  const textSec  = isDark ? "text-gray-400": "text-gray-500";
  const textMut  = isDark ? "text-gray-600": "text-gray-400";
  const inputCls = isDark
    ? "bg-gray-900 border-gray-800 text-white placeholder-gray-600 focus:border-indigo-500"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500";
  const chipBase = isDark
    ? "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600"
    : "bg-gray-100 border-gray-200 text-gray-600 hover:border-gray-400";
  const chipSel  = "bg-indigo-500/10 border-indigo-500 text-indigo-400";

  const INPUT_CLS = `w-full px-4 py-3.5 rounded-2xl ${inputCls} text-base focus:outline-none transition-colors`;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    rubro: "",
    barrio: "Reconquista (toda la ciudad)",
    whatsapp: "",
    telefono: "",
    direccion: "",
    horario: "",
    descripcion: "",
  });
  const [whatsappRaw, setWhatsappRaw] = useState("");

  // AI description
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExtra, setAiExtra] = useState({ zona: "" });

  // Photos
  const [mainPhoto, setMainPhoto] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const mainPhotoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

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

  // WhatsApp formatting
  function handleWhatsappChange(raw: string) {
    setWhatsappRaw(raw);
    const digits = raw.replace(/\D/g, "");
    if (!digits) { setForm((f) => ({ ...f, whatsapp: "" })); return; }
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
      const res = await fetch(`${API}/api/ai/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          rubro: form.rubro,
          nombre: form.nombre,
          barrio: form.barrio,
          zona: aiExtra.zona || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error generando descripcion");
      }
      const data = await res.json();
      setForm((f) => ({ ...f, descripcion: data.descripcion }));
      setAiOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo generar la descripcion.");
    } finally {
      setAiLoading(false);
    }
  }

  function handleMainPhoto(file: File | null) {
    setMainPhoto(file);
    if (file) {
      setMainPreview(URL.createObjectURL(file));
    } else {
      setMainPreview(null);
    }
  }

  function handleGalleryAdd(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 6 - gallery.length);
    setGallery((prev) => [...prev, ...newFiles]);
    setGalleryPreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
  }

  function removeGalleryItem(idx: number) {
    setGallery((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("nombre", form.nombre);
      fd.append("rubro", form.rubro);
      fd.append("barrio", form.barrio);
      fd.append("whatsapp", form.whatsapp);
      if (form.telefono) fd.append("telefono", form.telefono);
      if (form.direccion) fd.append("direccion", form.direccion);
      if (form.horario) fd.append("horario", form.horario);
      if (form.descripcion) fd.append("descripcion", form.descripcion);
      if (mainPhoto) fd.append("photo", mainPhoto);
      gallery.forEach((f, i) => fd.append(`photo${i}`, f));

      const res = await fetch(`${API}/api/comercios`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) {
        if (res.status === 409) {
          router.replace("/comercio/gestionar");
          return;
        }
        const data = await res.json();
        throw new Error(data.error || "Error al crear el comercio");
      }

      const comercio = await res.json();
      setCreatedSlug(comercio.slug);
      fireConfetti();
      goNext();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const onFinish = useCallback(
    () => router.push(`/comercio/${createdSlug}`),
    [router, createdSlug],
  );

  const canGoStep1 = form.nombre.trim() && form.rubro && form.whatsapp.length >= 11;
  const canGoStep2 = true;
  const canSubmit = !loading;

  if (isLoaded && !isSignedIn) {
    return (
      <div className={`min-h-screen ${pageBg} ${textPri} flex flex-col items-center justify-center px-6`}>
        <div className={`w-full max-w-sm rounded-2xl border ${border} ${cardBg} p-8 flex flex-col items-center text-center gap-5`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
            🏪
          </div>
          <div>
            <h2 className={`text-lg font-bold mb-2 ${textPri}`}>Necesitás una cuenta</h2>
            <p className={`text-sm leading-relaxed ${textSec}`}>
              Para registrar tu comercio tenés que iniciar sesión primero. Es gratis y tarda menos de un minuto.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => router.push(`/sign-in?redirect_url=/comercio/nuevo`)}
              className={`w-full py-3 rounded-2xl font-semibold text-sm transition-colors ${isDark ? "bg-white text-gray-900 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800"}`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => router.back()}
              className={`w-full py-3 rounded-2xl text-sm font-medium ${textSec} transition-colors`}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step definitions
  const steps = [
    {
      // Step 0 — Datos básicos
      icon: <Store className="w-8 h-8 text-amber-400" />,
      iconBg: "bg-amber-500/20",
      title: "¿Cómo se llama tu comercio?",
      subtitle: "El nombre que tus clientes ya conocen",
      content: (
        <div className="flex flex-col gap-5">
          <div>
            <label className={`text-xs mb-1.5 block ${textSec}`}>Nombre del comercio</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Almacén El Cruce"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={`text-xs mb-2 block ${textSec}`}>Rubro</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {RUBROS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, rubro: r }))}
                  className={`px-3 py-2 rounded-2xl text-sm border text-left transition-all ${
                    form.rubro === r
                      ? "bg-amber-500/10 border-amber-500 text-amber-300"
                      : chipBase
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`text-xs mb-1.5 block ${textSec}`}>WhatsApp</label>
            <input
              value={whatsappRaw}
              onChange={(e) => handleWhatsappChange(e.target.value)}
              placeholder="Ej: 3482 123456"
              inputMode="numeric"
              className={INPUT_CLS}
            />
            {form.whatsapp.length >= 11 && (
              <p className="text-xs mt-1.5 text-green-400">Listo: wa.me/{form.whatsapp}</p>
            )}
            {whatsappRaw && form.whatsapp.length < 11 && (
              <p className="text-xs mt-1.5 text-yellow-500">Número incompleto.</p>
            )}
          </div>

          <div>
            <label className={`text-xs mb-1.5 block ${textSec}`}>
              Teléfono <span className={textMut}>(opcional)</span>
            </label>
            <input
              value={form.telefono}
              onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              placeholder="03482-XXXXXX"
              className={INPUT_CLS}
            />
          </div>
        </div>
      ),
      canContinue: !!canGoStep1,
      onContinue: goNext,
    },
    {
      // Step 1 — Info del local
      icon: <MapPin className="w-8 h-8 text-blue-400" />,
      iconBg: "bg-blue-500/20",
      title: "¿Dónde encontrarte?",
      subtitle: "Todo opcional, pero suma mucho",
      content: (
        <div className="flex flex-col gap-5">
          <div>
            <label className={`text-xs mb-1.5 block ${textSec}`}>
              Dirección <span className={textMut}>(opcional)</span>
            </label>
            <input
              value={form.direccion}
              onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
              placeholder="Ej: San Martín 1234"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={`text-xs mb-1.5 block ${textSec}`}>
              Horario <span className={textMut}>(opcional)</span>
            </label>
            <input
              value={form.horario}
              onChange={(e) => setForm((f) => ({ ...f, horario: e.target.value }))}
              placeholder="Ej: Lunes a Viernes 9 a 18hs, Sábados 9 a 13hs"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={`text-xs mb-1.5 flex items-center justify-between ${textSec}`}>
              <span>Descripción <span className={textMut}>(opcional)</span></span>
              <span className={textMut}>{form.descripcion.length}/500</span>
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value.slice(0, 500) }))}
              placeholder="Contá qué venden, qué los diferencia, si tienen delivery, etc."
              rows={4}
              className={`w-full px-4 py-3.5 rounded-2xl border ${inputCls} text-base focus:outline-none transition-colors resize-none`}
            />

            {/* Generar con IA */}
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
                  Una pregunta rápida y la IA escribe el borrador
                </p>
                <input
                  value={aiExtra.zona}
                  onChange={(e) => setAiExtra({ zona: e.target.value })}
                  placeholder="Zonas donde entregan / donde atienden (opcional)"
                  className={`w-full px-4 py-3 rounded-2xl border ${inputCls} text-sm focus:outline-none transition-colors`}
                />
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
        </div>
      ),
      canContinue: canGoStep2,
      onContinue: goNext,
    },
    {
      // Step 2 — Fotos
      icon: <Camera className="w-8 h-8 text-pink-400" />,
      iconBg: "bg-pink-500/20",
      title: "Mostrá tu comercio",
      subtitle: "Una buena foto hace la diferencia",
      content: (
        <div className="flex flex-col gap-6">
          {/* Foto principal */}
          <div>
            <label className={`text-xs mb-3 block ${textSec}`}>Logo o foto principal</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => mainPhotoRef.current?.click()}
                className={`w-24 h-24 rounded-full border-2 border-dashed ${isDark ? "border-gray-700 hover:border-gray-500 bg-gray-900" : "border-gray-300 hover:border-gray-400 bg-gray-100"} flex items-center justify-center overflow-hidden transition-colors`}
              >
                {mainPreview ? (
                  <img src={mainPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className={`w-8 h-8 ${textMut}`} />
                )}
              </button>
              <div>
                <p className={`text-sm font-medium ${textPri}`}>
                  {mainPreview ? "Foto seleccionada" : "Sin foto aún"}
                </p>
                <p className={`text-xs mt-1 ${textMut}`}>Circular, recomendado 400x400px</p>
                {mainPreview && (
                  <button
                    type="button"
                    onClick={() => { setMainPhoto(null); setMainPreview(null); }}
                    className="text-xs mt-1 text-red-400 hover:text-red-300"
                  >
                    Quitar foto
                  </button>
                )}
              </div>
            </div>
            <input
              ref={mainPhotoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleMainPhoto(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Galería */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={`text-xs ${textSec}`}>
                Galería <span className={textMut}>({gallery.length}/6)</span>
              </label>
              {gallery.length < 6 && (
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className={`text-xs px-3 py-1.5 rounded-xl border ${border} ${textSec} hover:border-gray-600 transition-colors`}
                >
                  + Agregar fotos
                </button>
              )}
            </div>

            {gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {galleryPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square">
                    <div className={`w-full h-full rounded-xl overflow-hidden border ${border}`}>
                      <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {gallery.length === 0 && (
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className={`w-full py-10 rounded-xl border-2 border-dashed ${isDark ? "border-gray-700 hover:border-gray-500 text-gray-500" : "border-gray-300 hover:border-gray-400 text-gray-400"} flex flex-col items-center gap-2 transition-colors`}
              >
                <Camera className="w-8 h-8" />
                <span className="text-xs">Agregar fotos del local</span>
              </button>
            )}

            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleGalleryAdd(e.target.files)}
            />
          </div>

          {error && (
            <p className="text-sm border rounded-2xl px-4 py-3 text-red-400 bg-red-900/20 border-red-800">
              {error}
            </p>
          )}
        </div>
      ),
      canContinue: canSubmit,
      onContinue: handleSubmit,
      ctaLabel: loading ? "Publicando..." : "Publicar comercio",
    },
    {
      // Step 3 — Notificaciones
      icon: <Bell className="w-8 h-8 text-violet-400" />,
      iconBg: "bg-violet-500/20",
      title: "Casi listo",
      subtitle: "Avisamos cuando un cliente quiere contactarte",
      content: (
        <Step4Notificaciones
          permission={permission}
          isSupported={isSupported}
          requestPermission={requestPermission}
          onFinish={onFinish}
        />
      ),
      canContinue: false,
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
              {/* Ícono del step */}
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

              {/* Título y subtítulo */}
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
              {("ctaLabel" in currentStep && currentStep.ctaLabel) || "Continuar"}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
