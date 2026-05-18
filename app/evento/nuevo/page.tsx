"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Upload, Calendar, MapPin, Ticket, FileText,
  Music, UtensilsCrossed, Trophy, Mic2, Palette,
  PartyPopper, ShoppingBag, GraduationCap, Heart, Tag,
  Loader2, Check, Share2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/contexts/ThemeContext";
import { CATEGORIAS_EVENTO } from "@/lib/types/evento";
import { API_URL } from "@/lib/api/client";
import { useConfetti } from "@/hooks/useConfetti";

const CATEGORIA_ICON: Record<string, React.ElementType> = {
  "Música":      Music,
  "Gastronomía": UtensilsCrossed,
  "Deportes":    Trophy,
  "Teatro":      Mic2,
  "Arte":        Palette,
  "Fiesta":      PartyPopper,
  "Feria":       ShoppingBag,
  "Educación":   GraduationCap,
  "Solidario":   Heart,
  "Otro":        Tag,
};

const TOTAL = 3;

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
};

const inp = (isDark: boolean) =>
  `w-full text-sm px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
    isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
           : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
  }`;

const lab = (isDark: boolean) =>
  `text-xs font-semibold mb-1 block ${isDark ? "text-gray-400" : "text-gray-500"}`;

export default function NuevoEventoPage() {
  const { isDark } = useTheme();
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  const { fire } = useConfetti();
  const bannerRef = useRef<HTMLInputElement>(null);
  const logoRef   = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [dir,  setDir]  = useState(1);

  const [nombre,      setNombre]      = useState("");
  const [organizador, setOrganizador] = useState("");
  const [categoria,   setCategoria]   = useState("Música");
  const [lugar,       setLugar]       = useState("");
  const [barrio,      setBarrio]      = useState("");
  const [direccion,   setDireccion]   = useState("");
  const [fecha,       setFecha]       = useState("");
  const [fechaFin,    setFechaFin]    = useState("");
  const [precio,      setPrecio]      = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [bannerFile,    setBannerFile]    = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile,      setLogoFile]      = useState<File | null>(null);
  const [logoPreview,   setLogoPreview]   = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [linkCopied,  setLinkCopied]  = useState(false);

  function goNext() { setDir(1);  setStep(s => s + 1); }
  function goBack() { setDir(-1); setStep(s => s - 1); }

  useEffect(() => { if (createdSlug) fire(); }, [createdSlug]);

  function handleImg(file: File | null, setFile: (f: File | null) => void, setPrev: (u: string | null) => void) {
    if (!file) return;
    setFile(file);
    setPrev(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!nombre || !lugar || !fecha || !organizador) {
      setError("Completá nombre, organizador, lugar y fecha");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("nombre",      nombre);
      fd.append("organizador", organizador);
      fd.append("categoria",   categoria);
      fd.append("lugar",       lugar);
      fd.append("fecha",       fecha);
      if (barrio)      fd.append("barrio",      barrio);
      if (direccion)   fd.append("direccion",   direccion);
      if (fechaFin)    fd.append("fechaFin",    fechaFin);
      if (precio)      fd.append("precio",      precio);
      if (descripcion) fd.append("descripcion", descripcion);
      if (bannerFile)  fd.append("banner",      bannerFile);
      if (logoFile)    fd.append("logo",        logoFile);

      const res = await fetch(`${API_URL}/api/eventos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token ?? ""}` },
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as any).error ?? "Error al crear el evento");
      }
      const data = await res.json();
      setCreatedSlug(data.slug);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/evento/${createdSlug}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const card = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const CatIcon = CATEGORIA_ICON[categoria] ?? Tag;

  // ── Contenido por paso ────────────────────────────────────────────────────

  function renderStep() {
    switch (step) {

      // Paso 1 — Banner + nombre + categoría
      case 1: return (
        <div className="p-5 space-y-5">
          {/* Banner */}
          <div>
            <label className={lab(isDark)}>Banner del evento</label>
            <div
              className={`relative h-44 rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed transition-colors ${
                bannerPreview ? "border-transparent" : isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => bannerRef.current?.click()}
            >
              {bannerPreview ? (
                <Image src={bannerPreview} alt="banner" fill className="object-cover" />
              ) : (
                <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                  <Upload className={`w-8 h-8 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                  <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Tocá para subir el banner</p>
                  <p className={`text-xs ${isDark ? "text-gray-600" : "text-gray-300"}`}>Recomendado 1200x600</p>
                </div>
              )}
            </div>
            <input ref={bannerRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleImg(e.target.files?.[0] ?? null, setBannerFile, setBannerPreview)} />
          </div>

          {/* Nombre */}
          <div>
            <label className={lab(isDark)}>Nombre del evento *</label>
            <input className={inp(isDark)} placeholder="Ej: Festival de Jazz de Reconquista"
              value={nombre} onChange={e => setNombre(e.target.value)} maxLength={150} autoFocus />
          </div>

          {/* Organizador */}
          <div>
            <label className={lab(isDark)}>Organizador *</label>
            <input className={inp(isDark)} placeholder="Banda, local, institución..."
              value={organizador} onChange={e => setOrganizador(e.target.value)} maxLength={100} />
          </div>

          {/* Categoría */}
          <div>
            <label className={lab(isDark)}>Categoría *</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIAS_EVENTO.map(cat => {
                const Icon = CATEGORIA_ICON[cat] ?? Tag;
                const active = categoria === cat;
                return (
                  <button key={cat} type="button" onClick={() => setCategoria(cat)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      active
                        ? "bg-indigo-500 border-indigo-500 text-white"
                        : isDark
                          ? "border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" /> {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );

      // Paso 2 — Fecha, lugar, precio
      case 2: return (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lab(isDark)}><Calendar className="inline w-3 h-3 mr-1" />Inicio *</label>
              <input type="datetime-local" className={inp(isDark)} value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            <div>
              <label className={lab(isDark)}>Fin (opcional)</label>
              <input type="datetime-local" className={inp(isDark)} value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={lab(isDark)}><MapPin className="inline w-3 h-3 mr-1" />Lugar *</label>
            <input className={inp(isDark)} placeholder="Nombre del lugar o salón"
              value={lugar} onChange={e => setLugar(e.target.value)} maxLength={150} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lab(isDark)}>Barrio</label>
              <input className={inp(isDark)} placeholder="Centro, Norte..."
                value={barrio} onChange={e => setBarrio(e.target.value)} maxLength={100} />
            </div>
            <div>
              <label className={lab(isDark)}>Dirección</label>
              <input className={inp(isDark)} placeholder="Calle y número"
                value={direccion} onChange={e => setDireccion(e.target.value)} maxLength={200} />
            </div>
          </div>

          <div>
            <label className={lab(isDark)}><Ticket className="inline w-3 h-3 mr-1" />Precio</label>
            <input className={inp(isDark)} placeholder="Gratis / $1500 / Consultar"
              value={precio} onChange={e => setPrecio(e.target.value)} maxLength={80} />
          </div>
        </div>
      );

      // Paso 3 — Descripción + logo — o Listo si ya se creó
      case 3: return createdSlug ? (
        <div className="p-5 flex flex-col items-center justify-center text-center h-full gap-4 min-h-[300px]">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center">
            <CatIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-black mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Evento publicado</h3>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{nombre}</p>
          </div>
          <button onClick={handleCopyLink}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all w-full justify-center ${
              linkCopied
                ? isDark ? "border-green-500/40 bg-green-500/10 text-green-400" : "border-green-200 bg-green-50 text-green-600"
                : isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}>
            {linkCopied ? <><Check className="w-4 h-4" />Link copiado!</> : <><Share2 className="w-4 h-4" />Copiar link del evento</>}
          </button>
        </div>
      ) : (
        <div className="p-5 space-y-4">
          <div>
            <label className={lab(isDark)}><FileText className="inline w-3 h-3 mr-1" />Descripción</label>
            <textarea className={`${inp(isDark)} resize-none`} rows={5}
              placeholder="Contá de qué se trata, qué esperar, quiénes participan..."
              value={descripcion} onChange={e => setDescripcion(e.target.value)} maxLength={1000} />
            <p className={`text-xs mt-1 text-right ${isDark ? "text-gray-600" : "text-gray-300"}`}>{descripcion.length}/1000</p>
          </div>

          <div>
            <label className={lab(isDark)}>Logo del organizador (opcional)</label>
            <div className="flex items-center gap-3">
              {logoPreview && (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                  <Image src={logoPreview} alt="logo" width={56} height={56} className="object-cover w-full h-full" />
                </div>
              )}
              <button type="button" onClick={() => logoRef.current?.click()}
                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-colors ${
                  isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}>
                <Upload className="w-3 h-3" />{logoPreview ? "Cambiar logo" : "Subir logo"}
              </button>
              <input ref={logoRef} type="file" accept="image/*" className="hidden"
                onChange={e => handleImg(e.target.files?.[0] ?? null, setLogoFile, setLogoPreview)} />
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      );
    }
  }

  // ── Footer por paso ───────────────────────────────────────────────────────

  function renderFooter() {
    const btnBase = "flex-1 py-3 rounded-2xl text-sm font-semibold transition-colors";
    const btnPri  = `${btnBase} bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50`;
    const btnSec  = `px-5 py-3 rounded-2xl border text-sm font-medium transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`;

    if (step === 1) return (
      <button onClick={goNext} disabled={!nombre.trim() || !organizador.trim()} className={btnPri}>
        Siguiente
      </button>
    );
    if (step === 2) return (
      <>
        <button onClick={goBack} className={btnSec}>Atras</button>
        <button onClick={goNext} disabled={!fecha || !lugar} className={btnPri}>
          Siguiente
        </button>
      </>
    );
    if (step === 3 && !createdSlug) return (
      <>
        <button onClick={goBack} className={btnSec}>Atras</button>
        <button onClick={handleSubmit} disabled={submitting} className={btnPri}>
          {submitting ? <><Loader2 className="inline w-4 h-4 animate-spin mr-1" />Publicando...</> : "Publicar"}
        </button>
      </>
    );
    if (step === 3 && createdSlug) return (
      <>
        <button onClick={() => router.push("/eventos")} className={btnSec}>Ver eventos</button>
        <button onClick={() => router.push(`/evento/${createdSlug}`)} className={btnPri}>
          Ver mi evento
        </button>
      </>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
      <Navbar />

      {/* Wizard card — full screen mobile, centered card desktop */}
      <div className="fixed inset-0 md:flex md:items-center md:justify-center md:bg-black/60 md:p-6 z-10">
        <div className={`flex flex-col w-full h-full md:h-[640px] md:max-h-[90vh] md:max-w-lg md:rounded-2xl md:shadow-2xl overflow-hidden ${isDark ? "bg-gray-950" : "bg-white"}`}>

          {/* Header */}
          <div className={`flex items-center justify-between px-4 pt-safe-top pt-4 pb-3 border-b flex-shrink-0 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            <button onClick={() => step === 1 ? router.back() : goBack()}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}>
              <X className="w-5 h-5" />
            </button>
            <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Publicar evento
            </span>
            <span className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {step}/{TOTAL}
            </span>
          </div>

          {/* Progress bar */}
          <div className={`flex-shrink-0 h-1 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
            <div className="h-full bg-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${(step / TOTAL) * 100}%` }} />
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto overscroll-contain relative">
            <AnimatePresence custom={dir} mode="wait">
              <motion.div key={step} custom={dir} variants={variants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="absolute inset-0 overflow-y-auto"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className={`flex-shrink-0 border-t px-4 py-4 pb-safe-bottom flex gap-3 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            {renderFooter()}
          </div>
        </div>
      </div>
    </div>
  );
}
