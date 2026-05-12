"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { User, Wrench, FileText, Bell, ArrowLeft } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useConfetti } from "../../hooks/useConfetti";
import { useTheme } from "../../contexts/ThemeContext";
import { TOTAL_STEPS, STEP_VARIANTS, ICON_VARIANTS } from "./constants";
import type { ProfesionalForm, AiForm } from "./types";
import { StepDatos } from "./components/StepDatos";
import { StepEspecialidad } from "./components/StepEspecialidad";
import { StepPerfil } from "./components/StepPerfil";
import { StepNotificaciones } from "./components/StepNotificaciones";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function NuevoProfesionalClient() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { permission, isSupported, requestPermission } = useNotifications();
  const { isDark } = useTheme();

  const pageBg   = isDark ? "bg-gray-950"    : "bg-gray-50";
  const headerBg = isDark ? "bg-gray-950/90" : "bg-gray-50/90";
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
  const chipSel = "bg-indigo-500/10 border-indigo-500 text-indigo-400";

  const { fire: fireConfetti } = useConfetti();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");
  const [createdId, setCreatedId] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [whatsappRaw, setWhatsappRaw] = useState("");
  const [aiForm, setAiForm] = useState<AiForm>({ anios: "", zona: "" });
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [form, setForm] = useState<ProfesionalForm>({
    nombre: "", apellido: "", telefono: "", whatsapp: "",
    tipo: "", oficios: [], oficioCustom: "",
    descripcion: "", experiencia: "", pin: "", pinConfirm: "",
  });

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
    if (digits.startsWith("549"))      formatted = digits;
    else if (digits.startsWith("54"))  formatted = "549" + digits.slice(2);
    else if (digits.startsWith("0"))   formatted = "549" + digits.slice(1);
    else                               formatted = "549" + digits;
    setForm((f) => ({ ...f, whatsapp: formatted }));
  }

  async function handleGenerarDescripcion() {
    setAiLoading(true);
    try {
      const token = await getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API}/api/ai/generate-description`, {
        method: "POST",
        headers,
        body: JSON.stringify({ oficios: form.oficios, nombre: form.nombre, anios: aiForm.anios || undefined, zona: aiForm.zona || undefined }),
      });
      if (!res.ok) throw new Error("Error generando descripcion");
      const data = await res.json();
      setForm((f) => ({ ...f, descripcion: data.descripcion }));
      setAiOpen(false);
    } catch { /* silently fail — user can write manually */ }
    finally { setAiLoading(false); }
  }

  function toggleOficio(oficio: string) {
    setForm((f) => ({
      ...f,
      oficios: f.oficios.includes(oficio)
        ? f.oficios.filter((o) => o !== oficio)
        : f.oficios.length < 3 ? [...f.oficios, oficio] : f.oficios,
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
      const descripcionFinal = [form.descripcion, form.experiencia ? `\n\nExperiencia: ${form.experiencia}` : ""].join("").trim();
      const token = await getToken();
      const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (token) authHeaders["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API}/api/professionals`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          nombre: form.nombre, apellido: form.apellido,
          telefono: form.telefono, whatsapp: form.whatsapp,
          tipo: form.tipo || "oficio",
          oficios: form.oficios.map((o) => o.toLowerCase()),
          descripcion: descripcionFinal,
          pin: form.pin || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear perfil");
      }
      const pro = await res.json();
      setCreatedSlug(pro.slug);
      setCreatedId(pro.id);
      localStorage.setItem("professional_panel_code", pro.id);
      fireConfetti();
      goNext();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const onFinish = useCallback(() => router.push(`/profesional/${createdSlug}`), [router, createdSlug]);

  const pinValid = /^\d{4}$/.test(form.pin) && form.pin === form.pinConfirm;
  const canGoStep1 = !!(form.nombre && form.apellido && form.whatsapp.length >= 6 && pinValid);
  const canGoStep2 = form.tipo !== "" && form.oficios.length > 0;
  const canSubmit  = form.descripcion.length >= 30;

  const steps = [
    {
      icon: <User className="w-8 h-8 text-indigo-400" />,
      iconBg: "bg-indigo-500/20",
      title: "¿Cómo te llamás?",
      subtitle: "Así te van a ver tus clientes",
      content: (
        <StepDatos
          form={form} setForm={setForm}
          whatsappRaw={whatsappRaw} onWhatsappChange={handleWhatsappChange}
          showPin={showPin} setShowPin={setShowPin}
          inputCls={inputCls} isDark={isDark} textSec={textSec} textMut={textMut}
        />
      ),
      canContinue: canGoStep1,
      onContinue: goNext,
    },
    {
      icon: <Wrench className="w-8 h-8 text-amber-400" />,
      iconBg: "bg-amber-500/20",
      title: "¿Cuál es tu oficio?",
      subtitle: "Podés agregar hasta 3",
      content: (
        <StepEspecialidad
          form={form} setForm={setForm}
          onToggleOficio={toggleOficio} onAddCustomOficio={addCustomOficio}
          chipBase={chipBase} chipSel={chipSel} inputCls={inputCls}
          textSec={textSec} textMut={textMut}
        />
      ),
      canContinue: canGoStep2,
      onContinue: goNext,
    },
    {
      icon: <FileText className="w-8 h-8 text-emerald-400" />,
      iconBg: "bg-emerald-500/20",
      title: "Contanos sobre vos",
      subtitle: "Esto es lo primero que van a leer tus clientes",
      content: (
        <StepPerfil
          form={form} setForm={setForm}
          aiForm={aiForm} setAiForm={setAiForm}
          aiOpen={aiOpen} setAiOpen={setAiOpen}
          aiLoading={aiLoading} onGenerarDescripcion={handleGenerarDescripcion}
          error={error} inputCls={inputCls} isDark={isDark}
          textSec={textSec} textMut={textMut} border={border}
        />
      ),
      canContinue: canSubmit && !loading,
      onContinue: handleSubmit,
      ctaLabel: loading ? "Creando perfil..." : "Publicar perfil",
    },
    {
      icon: <Bell className="w-8 h-8 text-violet-400" />,
      iconBg: "bg-violet-500/20",
      title: "Activá las notificaciones",
      subtitle: "Avisamos cuando un cliente quiere contactarte",
      content: (
        <StepNotificaciones
          permission={permission} isSupported={isSupported}
          requestPermission={requestPermission}
          createdId={createdId} onFinish={onFinish}
          onGoPanel={() => router.push("/profesional/gestionar")}
          isDark={isDark}
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
              {currentStep.ctaLabel ?? "Continuar"}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
