"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Store, MapPin, Camera, Bell, ArrowLeft } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useConfetti } from "../../hooks/useConfetti";
import { useTheme } from "../../contexts/ThemeContext";
import { TOTAL_STEPS, STEP_VARIANTS, ICON_VARIANTS } from "./constants";
import type { ComercioForm, AiExtra } from "./types";
import { StepContacto } from "./components/StepContacto";
import { StepRubro } from "./components/StepRubro";
import { StepInfo } from "./components/StepInfo";
import { StepFotos } from "./components/StepFotos";
import { StepNotificaciones } from "./components/StepNotificaciones";

import { API_URL } from "../../lib/api/client";

export default function NuevoComercioClient() {
  const router = useRouter();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { permission, isSupported, requestPermission } = useNotifications();
  const { fire: fireConfetti } = useConfetti();
  const { isDark } = useTheme();

  const pageBg   = isDark ? "bg-gray-950"    : "bg-gray-50";
  const headerBg = isDark ? "bg-gray-950/90" : "bg-gray-50/90";
  const cardBg   = isDark ? "bg-gray-900"    : "bg-white";
  const border   = isDark ? "border-gray-800" : "border-gray-200";
  const textPri  = isDark ? "text-white"     : "text-gray-900";
  const textSec  = isDark ? "text-gray-400"  : "text-gray-500";
  const textMut  = isDark ? "text-gray-600"  : "text-gray-400";
  const inputCls = isDark
    ? "bg-gray-900 border-gray-800 text-white placeholder-gray-600 focus:border-indigo-500"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500";
  const chipBase = isDark
    ? "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600"
    : "bg-gray-100 border-gray-200 text-gray-600 hover:border-gray-400";

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");

  const [form, setForm] = useState<ComercioForm>({
    nombre: "", rubro: "", barrio: "Reconquista (toda la ciudad)",
    whatsapp: "", telefono: "", direccion: "", horario: "", descripcion: "",
  });
  const [whatsappRaw, setWhatsappRaw] = useState("");

  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExtra, setAiExtra] = useState<AiExtra>({ zona: "" });

  const [mainPhoto, setMainPhoto] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const mainPhotoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function goNext() { setDirection(1); setStep((s) => s + 1); }
  function goBack() {
    if (step === 0) { router.back(); return; }
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function handleWhatsappChange(raw: string) {
    setWhatsappRaw(raw);
    const digits = raw.replace(/\D/g, "");
    if (!digits) { setForm((f) => ({ ...f, whatsapp: "" })); return; }
    let formatted = digits;
    if (digits.startsWith("549")) formatted = digits;
    else if (digits.startsWith("54")) formatted = "549" + digits.slice(2);
    else if (digits.startsWith("0")) formatted = "549" + digits.slice(1);
    else formatted = "549" + digits;
    setForm((f) => ({ ...f, whatsapp: formatted }));
  }

  async function handleGenerarDescripcion() {
    setAiLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/ai/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rubro: form.rubro, nombre: form.nombre, barrio: form.barrio, zona: aiExtra.zona || undefined }),
      });
      if (!res.ok) throw new Error("Error generando descripcion");
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
    setMainPreview(file ? URL.createObjectURL(file) : null);
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

      const res = await fetch(`/api/comercios`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) {
        if (res.status === 409) { router.replace("/comercio/gestionar"); return; }
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

  const steps = [
    {
      icon: <Store className="w-8 h-8 text-amber-400" />,
      iconBg: "bg-amber-500/20",
      title: "¿Cómo se llama tu comercio?",
      subtitle: "El nombre que tus clientes ya conocen",
      content: (
        <StepContacto
          form={form} setForm={setForm}
          whatsappRaw={whatsappRaw} onWhatsappChange={handleWhatsappChange}
          inputCls={inputCls} textSec={textSec} textMut={textMut}
        />
      ),
      canContinue: !!(form.nombre.trim() && form.whatsapp.length >= 11),
      onContinue: goNext,
    },
    {
      icon: <Store className="w-8 h-8 text-orange-400" />,
      iconBg: "bg-orange-500/20",
      title: "¿Cuál es tu rubro?",
      subtitle: "Elegí uno o escribí el tuyo",
      content: (
        <StepRubro
          form={form} setForm={setForm}
          chipBase={chipBase} inputCls={inputCls} textMut={textMut}
        />
      ),
      canContinue: !!form.rubro,
      onContinue: goNext,
    },
    {
      icon: <MapPin className="w-8 h-8 text-blue-400" />,
      iconBg: "bg-blue-500/20",
      title: "¿Dónde encontrarte?",
      subtitle: "Todo opcional, pero suma mucho",
      content: (
        <StepInfo
          form={form} setForm={setForm}
          aiExtra={aiExtra} setAiExtra={setAiExtra}
          aiOpen={aiOpen} setAiOpen={setAiOpen}
          aiLoading={aiLoading} onGenerarDescripcion={handleGenerarDescripcion}
          inputCls={inputCls} textSec={textSec} textMut={textMut} border={border}
        />
      ),
      canContinue: true,
      onContinue: goNext,
    },
    {
      icon: <Camera className="w-8 h-8 text-pink-400" />,
      iconBg: "bg-pink-500/20",
      title: "Mostrá tu comercio",
      subtitle: "Una buena foto hace la diferencia",
      content: (
        <StepFotos
          mainPreview={mainPreview} galleryPreviews={galleryPreviews} galleryCount={gallery.length}
          onMainPhotoClick={() => mainPhotoRef.current?.click()}
          onMainPhotoClear={() => handleMainPhoto(null)}
          onGalleryClick={() => galleryRef.current?.click()}
          onRemoveGallery={removeGalleryItem}
          mainPhotoRef={mainPhotoRef} galleryRef={galleryRef}
          onMainPhotoChange={(e) => handleMainPhoto(e.target.files?.[0] ?? null)}
          onGalleryChange={(e) => handleGalleryAdd(e.target.files)}
          error={error}
          isDark={isDark} textSec={textSec} textMut={textMut} textPri={textPri} border={border}
        />
      ),
      canContinue: !loading,
      onContinue: handleSubmit,
      ctaLabel: loading ? "Publicando..." : "Publicar comercio",
    },
    {
      icon: <Bell className="w-8 h-8 text-violet-400" />,
      iconBg: "bg-violet-500/20",
      title: "Casi listo",
      subtitle: "Avisamos cuando un cliente quiere contactarte",
      content: (
        <StepNotificaciones
          permission={permission} isSupported={isSupported}
          requestPermission={requestPermission} onFinish={onFinish}
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
      <div className={`fixed top-0 left-0 right-0 z-10 ${headerBg} backdrop-blur-sm px-4 pt-safe`}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={goBack}
              className={`w-10 h-10 flex items-center justify-center rounded-2xl ${textSec} transition-colors`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className={`text-sm ${textSec}`}>paso {step + 1}/{TOTAL_STEPS}</span>
            <div className="w-10" />
          </div>
          <div className={`h-1 ${isDark ? "bg-gray-800" : "bg-gray-200"} rounded-full mb-2`}>
            <motion.div
              className="h-1 bg-indigo-500 rounded-full"
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col pt-[88px] pb-32">
        <div className="max-w-lg mx-auto w-full px-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={STEP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="flex flex-col"
            >
              <div className="flex justify-center mt-8 mb-8">
                <motion.div
                  variants={ICON_VARIANTS}
                  initial="hidden"
                  animate="visible"
                  className={`w-24 h-24 rounded-full ${currentStep.iconBg} flex items-center justify-center`}
                >
                  {currentStep.icon}
                </motion.div>
              </div>
              <h1 className={`text-2xl font-bold ${textPri} text-center mb-2`}>{currentStep.title}</h1>
              <p className={`${textSec} text-center mb-8`}>{currentStep.subtitle}</p>
              {currentStep.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

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
