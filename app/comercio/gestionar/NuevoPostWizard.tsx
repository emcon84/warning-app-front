"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Megaphone, Tag, Gift, Camera, ChevronRight } from "lucide-react";
import { useConfetti } from "../../hooks/useConfetti";
import { useTheme } from "../../contexts/ThemeContext";

import { API_URL } from "../../lib/api/client";

const TOTAL = 3;

interface Props {
  comercio: {
    id: string;
    nombre: string;
    slug: string;
  };
  getToken: () => Promise<string | null>;
  onComplete: (post: { id: string; tipo: string; contenido: string }) => void;
  onClose: () => void;
}

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
};

export default function NuevoPostWizard({ comercio, getToken, onComplete, onClose }: Props) {
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const { fire } = useConfetti();

  const [tipo, setTipo] = useState<"novedad" | "oferta" | "sorteo" | null>(null);
  const [contenido, setContenido] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [precioAntes, setPrecioAntes] = useState("");
  const [precioDespues, setPrecioDespues] = useState("");
  const [fechaSorteo, setFechaSorteo] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdPost, setCreatedPost] = useState<{ id: string; tipo: string; contenido: string } | null>(null);

  function goNext() { setDir(1); setStep(s => s + 1); }
  function goBack() { setDir(-1); setStep(s => s - 1); }

  useEffect(() => { if (step === 3) fire(); }, [step, fire]);

  const inputCls = `w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
    isDark
      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-600"
      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
  }`;

  async function handleSubmit() {
    if (!contenido.trim() || !tipo) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("tipo", tipo);
      fd.append("contenido", contenido.trim());
      if (foto) fd.append("photo", foto);
      if (tipo === "oferta") {
        if (precioAntes) fd.append("precioAntes", precioAntes);
        if (precioDespues) fd.append("precioDespues", precioDespues);
      }
      if (tipo === "sorteo" && fechaSorteo) fd.append("fechaSorteo", fechaSorteo);
      const res = await fetch(`${API_URL}/api/comercios/${comercio.slug}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("error");
      const data = await res.json();
      setCreatedPost(data);
      goNext();
    } catch {
      setSubmitError("No se pudo publicar. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePublicarOtro() {
    if (createdPost) onComplete(createdPost);
    setStep(1);
    setDir(1);
    setTipo(null);
    setContenido("");
    setFoto(null);
    setFotoPreview(null);
    setPrecioAntes("");
    setPrecioDespues("");
    setFechaSorteo("");
    setSubmitError(null);
    setCreatedPost(null);
  }

  return (
    <div className="fixed inset-0 z-[3000] flex items-end md:items-center justify-center md:bg-black/60 md:p-6">
    <div className="bg-white dark:bg-gray-950 flex flex-col w-full h-full md:h-[640px] md:max-h-[90vh] md:max-w-lg md:rounded-2xl md:shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-safe-top pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Nueva publicacion</span>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{step}/{TOTAL}</span>
      </div>

      <div className="flex-shrink-0 h-1 bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full bg-amber-500 transition-all duration-500 ease-out"
          style={{ width: `${(step / TOTAL) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain relative">
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="absolute inset-0 overflow-y-auto"
          >
            {step === 1 && (
              <div className="p-5 space-y-4 pb-8">
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Que vas a compartir hoy?</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Elegí el tipo de publicacion</p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { setTipo("novedad"); goNext(); }}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                      isDark
                        ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60 hover:bg-amber-500/10"
                        : "border-amber-200 bg-amber-50 hover:border-amber-400 hover:bg-amber-100"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-7 h-7 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-gray-900 dark:text-white">Novedad</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Contale algo nuevo a tu comunidad</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-auto flex-shrink-0" />
                  </button>

                  <button
                    onClick={() => { setTipo("oferta"); goNext(); }}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                      isDark
                        ? "border-green-500/30 bg-green-500/5 hover:border-green-500/60 hover:bg-green-500/10"
                        : "border-green-200 bg-green-50 hover:border-green-400 hover:bg-green-100"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Tag className="w-7 h-7 text-green-500" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-gray-900 dark:text-white">Oferta</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Compartí una promo o descuento especial</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-auto flex-shrink-0" />
                  </button>

                  <button
                    onClick={() => { setTipo("sorteo"); goNext(); }}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                      isDark
                        ? "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60 hover:bg-purple-500/10"
                        : "border-purple-200 bg-purple-50 hover:border-purple-400 hover:bg-purple-100"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Gift className="w-7 h-7 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-gray-900 dark:text-white">Sorteo</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Crea un sorteo para tu comunidad</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-auto flex-shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-5 space-y-4 pb-8">
                {tipo && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold mb-4 ${
                    tipo === "novedad"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : tipo === "oferta"
                      ? "bg-green-500/15 text-green-600 dark:text-green-400"
                      : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                  }`}>
                    {tipo === "novedad" ? <Megaphone className="w-4 h-4" /> : tipo === "oferta" ? <Tag className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                    {tipo === "novedad" ? "Novedad" : tipo === "oferta" ? "Oferta" : "Sorteo"}
                  </div>
                )}

                <textarea
                  autoFocus
                  value={contenido}
                  onChange={e => setContenido(e.target.value)}
                  rows={5}
                  placeholder={
                    tipo === "oferta"
                      ? "Describe la oferta: qué incluye, condiciones, hasta cuándo..."
                      : tipo === "sorteo"
                      ? "Describe el sorteo: qué se sortea, cómo participar..."
                      : "Contale algo a tu comunidad..."
                  }
                  className={`w-full px-4 py-3.5 rounded-2xl border text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    isDark
                      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-600"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                />

                {tipo === "oferta" && (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={`text-xs font-medium block mb-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Precio antes
                      </label>
                      <input
                        type="text"
                        value={precioAntes}
                        onChange={e => setPrecioAntes(e.target.value)}
                        placeholder="$15.000"
                        className={inputCls}
                      />
                    </div>
                    <div className="flex-1">
                      <label className={`text-xs font-medium block mb-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Precio oferta
                      </label>
                      <input
                        type="text"
                        value={precioDespues}
                        onChange={e => setPrecioDespues(e.target.value)}
                        placeholder="$9.900"
                        className={inputCls}
                      />
                    </div>
                  </div>
                )}

                {tipo === "sorteo" && (
                  <div>
                    <label className={`text-xs font-medium block mb-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Fecha de cierre del sorteo
                    </label>
                    <input
                      type="datetime-local"
                      value={fechaSorteo}
                      onChange={e => setFechaSorteo(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                )}

                {fotoPreview ? (
                  <div className="relative w-full h-48">
                    <Image src={fotoPreview} alt="preview" fill className="object-cover rounded-2xl" unoptimized />
                    <button
                      onClick={() => { setFoto(null); setFotoPreview(null); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center gap-2 w-full py-5 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
                    isDark
                      ? "border-gray-700 text-gray-600 hover:border-gray-600 hover:bg-gray-900"
                      : "border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50"
                  }`}>
                    <Camera className="w-6 h-6" />
                    <span className="text-sm font-medium">Agregar foto (opcional)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setFoto(file);
                        const reader = new FileReader();
                        reader.onload = ev => setFotoPreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                )}

                {submitError && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl">
                    {submitError}
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center gap-4 pt-8 pb-6 px-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </motion.div>

                <div>
                  <p className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>Publicado!</p>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Tu comunidad ya puede verlo
                  </p>
                </div>

                {createdPost && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    createdPost.tipo === "novedad"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : createdPost.tipo === "oferta"
                      ? "bg-green-500/15 text-green-600 dark:text-green-400"
                      : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                  }`}>
                    {createdPost.tipo === "novedad" ? (
                      <Megaphone className="w-4 h-4" />
                    ) : createdPost.tipo === "oferta" ? (
                      <Tag className="w-4 h-4" />
                    ) : (
                      <Gift className="w-4 h-4" />
                    )}
                    <span className="capitalize">{createdPost.tipo}</span>
                  </div>
                )}

                <div className={`w-full rounded-2xl border p-4 text-sm text-left leading-relaxed whitespace-pre-wrap line-clamp-4 ${
                  isDark
                    ? "border-gray-800 bg-gray-900 text-gray-300"
                    : "border-gray-100 bg-gray-50 text-gray-700"
                }`}>
                  {createdPost?.contenido}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 px-4 py-4 pb-safe-bottom flex gap-3">
        {step === 2 && (
          <>
            <button
              onClick={goBack}
              className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Atras
            </button>
            <button
              onClick={handleSubmit}
              disabled={!contenido.trim() || submitting}
              className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
            >
              {submitting ? "Publicando..." : "Publicar"}
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <button
              onClick={handlePublicarOtro}
              className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Publicar otro
            </button>
            <button
              onClick={() => { if (createdPost) onComplete(createdPost); onClose(); }}
              className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm transition-colors"
            >
              Ver feed
            </button>
          </>
        )}
      </div>
    </div>
    </div>
  );
}
