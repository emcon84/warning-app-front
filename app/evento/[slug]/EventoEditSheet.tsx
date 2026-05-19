"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  X, Upload, Calendar, MapPin, Ticket, FileText, ImagePlus,
  Smile, Trash2, Loader2, Check, Music, UtensilsCrossed,
  Trophy, Mic2, Palette, PartyPopper, ShoppingBag, GraduationCap, Heart, Tag, Gift,
} from "lucide-react";
import type { Evento } from "@/lib/types/evento";
import { CATEGORIAS_EVENTO } from "@/lib/types/evento";
import { resolvePhotoUrl } from "@/lib/utils/photo";
import { API_URL } from "@/lib/api/client";

const EmojiPicker = dynamic(
  () => import("@emoji-mart/react").then(m => m.default),
  { ssr: false, loading: () => null }
);

const CATEGORIA_ICON: Record<string, React.ElementType> = {
  "Música": Music, "Gastronomía": UtensilsCrossed, "Deportes": Trophy,
  "Teatro": Mic2, "Arte": Palette, "Fiesta": PartyPopper,
  "Feria": ShoppingBag, "Educación": GraduationCap, "Solidario": Heart, "Otro": Tag,
};

function toDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

interface Props {
  evento: Evento;
  getToken: () => Promise<string | null>;
  isDark: boolean;
  onClose: () => void;
  onSaved: (updated: Evento) => void;
}

export function EventoEditSheet({ evento, getToken, isDark, onClose, onSaved }: Props) {
  const [nombre,      setNombre]      = useState(evento.nombre);
  const [organizador, setOrganizador] = useState(evento.organizador);
  const [categoria,   setCategoria]   = useState(evento.categoria);
  const [lugar,       setLugar]       = useState(evento.lugar);
  const [barrio,      setBarrio]      = useState(evento.barrio ?? "");
  const [direccion,   setDireccion]   = useState(evento.direccion ?? "");
  const [fecha,       setFecha]       = useState(toDatetimeLocal(evento.fecha));
  const [fechaFin,    setFechaFin]    = useState(toDatetimeLocal(evento.fechaFin));
  const [precio,      setPrecio]      = useState(evento.precio ?? "");
  const [descripcion,    setDescripcion]    = useState(evento.descripcion ?? "");
  const [tieneSorteo,    setTieneSorteo]    = useState((evento as any).tieneSorteo ?? false);
  const [countdownTexto, setCountdownTexto] = useState(evento.countdownTexto ?? "");

  const [bannerFile,  setBannerFile]  = useState<File | null>(null);
  const [bannerPrev,  setBannerPrev]  = useState<string | null>(evento.banner ? resolvePhotoUrl(evento.banner) : null);
  const [logoFile,    setLogoFile]    = useState<File | null>(null);
  const [logoPrev,    setLogoPrev]    = useState<string | null>(evento.logo ? resolvePhotoUrl(evento.logo) : null);
  const [newFotos,    setNewFotos]    = useState<File[]>([]);
  const [newFotosPrev, setNewFotosPrev] = useState<string[]>([]);
  const [showEmoji,   setShowEmoji]   = useState(false);

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const bannerRef  = useRef<HTMLInputElement>(null);
  const logoRef    = useRef<HTMLInputElement>(null);
  const fotosRef   = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const inp = `w-full text-sm px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
    isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
           : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
  }`;
  const lab = `text-xs font-semibold mb-1 block ${isDark ? "text-gray-400" : "text-gray-500"}`;

  function handleImg(file: File, setFile: (f: File) => void, setPrev: (s: string) => void) {
    setFile(file);
    setPrev(URL.createObjectURL(file));
  }

  function addFotos(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files).slice(0, 10 - newFotos.length);
    setNewFotos(p => [...p, ...arr]);
    setNewFotosPrev(p => [...p, ...arr.map(f => URL.createObjectURL(f))]);
  }

  function removeFoto(i: number) {
    setNewFotos(p => p.filter((_, idx) => idx !== i));
    setNewFotosPrev(p => p.filter((_, idx) => idx !== i));
  }

  function insertEmoji(emoji: any) {
    const native = emoji.native as string;
    const el = textareaRef.current;
    if (!el) { setDescripcion(d => d + native); return; }
    const s = el.selectionStart ?? descripcion.length;
    const e = el.selectionEnd   ?? descripcion.length;
    setDescripcion(descripcion.slice(0, s) + native + descripcion.slice(e));
    setShowEmoji(false);
    setTimeout(() => { el.focus(); el.setSelectionRange(s + native.length, s + native.length); }, 0);
  }

  async function handleSave() {
    if (!nombre.trim() || !lugar.trim() || !fecha || !organizador.trim()) {
      setError("Nombre, organizador, lugar y fecha son obligatorios");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("nombre",      nombre.trim());
      fd.append("organizador", organizador.trim());
      fd.append("categoria",   categoria);
      fd.append("lugar",       lugar.trim());
      fd.append("fecha",       fecha);
      if (barrio)      fd.append("barrio",      barrio);
      if (direccion)   fd.append("direccion",   direccion);
      if (fechaFin)    fd.append("fechaFin",    fechaFin);
      if (precio)      fd.append("precio",      precio);
      if (descripcion) fd.append("descripcion", descripcion);
      if (bannerFile)  fd.append("banner",      bannerFile);
      if (logoFile)    fd.append("logo",        logoFile);
      fd.append("tieneSorteo",    tieneSorteo ? "true" : "false");
      fd.append("countdownTexto", countdownTexto.trim());
      newFotos.forEach((f, i) => fd.append(`foto${i}`, f));

      const res = await fetch(`${API_URL}/api/eventos/${evento.slug}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token ?? ""}` },
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as any).error ?? "Error al guardar");
      }
      const updated = await res.json();
      onSaved(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[2000] bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div className={`fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-[2001]`}>
        <div className={`flex flex-col w-full max-h-[92vh] md:max-h-[90vh] md:max-w-xl md:rounded-2xl md:shadow-2xl overflow-hidden ${isDark ? "bg-gray-900" : "bg-white"} rounded-t-2xl`}>

          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3.5 border-b flex-shrink-0 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            <span className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Editar evento</span>
            <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-full ${isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* Banner */}
            <div>
              <label className={lab}>Banner</label>
              <div className="relative h-36 rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed transition-colors"
                onClick={() => bannerRef.current?.click()}>
                {bannerPrev ? (
                  <Image src={bannerPrev} alt="banner" fill className="object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center gap-2 ${isDark ? "bg-gray-800 text-gray-600" : "bg-gray-50 text-gray-300"}`}>
                    <Upload className="w-5 h-5" /><span className="text-xs">Subir banner</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              <input ref={bannerRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleImg(e.target.files[0], setBannerFile, setBannerPrev)} />
            </div>

            {/* Nombre + Organizador */}
            <div className="space-y-3">
              <div>
                <label className={lab}>Nombre *</label>
                <input className={inp} value={nombre} onChange={e => setNombre(e.target.value)} maxLength={150} />
              </div>
              <div>
                <label className={lab}>Organizador *</label>
                <input className={inp} value={organizador} onChange={e => setOrganizador(e.target.value)} maxLength={100} />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className={lab}>Categoría</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIAS_EVENTO.map(cat => {
                  const Icon = CATEGORIA_ICON[cat] ?? Tag;
                  return (
                    <button key={cat} type="button" onClick={() => setCategoria(cat)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                        categoria === cat
                          ? "bg-indigo-500 border-indigo-500 text-white"
                          : isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}>
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />{cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fecha + Lugar */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lab}><Calendar className="inline w-3 h-3 mr-1" />Inicio *</label>
                  <input type="datetime-local" className={inp} value={fecha} onChange={e => setFecha(e.target.value)} />
                </div>
                <div>
                  <label className={lab}>Fin</label>
                  <input type="datetime-local" className={inp} value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={lab}><MapPin className="inline w-3 h-3 mr-1" />Lugar *</label>
                <input className={inp} value={lugar} onChange={e => setLugar(e.target.value)} maxLength={150} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lab}>Barrio</label>
                  <input className={inp} placeholder="Centro..." value={barrio} onChange={e => setBarrio(e.target.value)} maxLength={100} />
                </div>
                <div>
                  <label className={lab}>Dirección</label>
                  <input className={inp} placeholder="Calle y nro." value={direccion} onChange={e => setDireccion(e.target.value)} maxLength={200} />
                </div>
              </div>
              <div>
                <label className={lab}><Ticket className="inline w-3 h-3 mr-1" />Precio</label>
                <input className={inp} placeholder="Gratis / $1500" value={precio} onChange={e => setPrecio(e.target.value)} maxLength={80} />
              </div>
            </div>

            {/* Toggle sorteo */}
            <button
              type="button"
              onClick={() => setTieneSorteo(v => !v)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                tieneSorteo
                  ? "border-amber-400 bg-amber-500/10"
                  : isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                tieneSorteo ? "bg-amber-500 text-black" : isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"
              }`}>
                <Gift className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-bold ${tieneSorteo ? (isDark ? "text-amber-400" : "text-amber-600") : (isDark ? "text-gray-300" : "text-gray-700")}`}>
                  {tieneSorteo ? "Sorteo activado" : "Activar sorteo"}
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Los asistentes obtienen un numero unico para el sorteo en vivo
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                tieneSorteo ? "border-amber-400 bg-amber-400" : isDark ? "border-gray-600" : "border-gray-300"
              }`}>
                {tieneSorteo && <Check className="w-3 h-3 text-black" />}
              </div>
            </button>

            {/* Countdown texto personalizado */}
            <div>
              <label className={lab}>Texto del contador regresivo (opcional)</label>
              <input
                className={inp}
                value={countdownTexto}
                onChange={e => setCountdownTexto(e.target.value)}
                placeholder='Por defecto: "Ya falta poco!"'
                maxLength={100}
              />
              <p className={`text-xs mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                Aparece sobre el banner la última semana antes del evento
              </p>
            </div>

            {/* Descripción con emoji */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={lab}><FileText className="inline w-3 h-3 mr-1" />Descripción</label>
                <button type="button" onClick={() => setShowEmoji(v => !v)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                    showEmoji ? "bg-amber-500/20 text-amber-400"
                              : isDark ? "text-gray-500 hover:bg-gray-800" : "text-gray-400 hover:bg-gray-100"
                  }`}>
                  <Smile className="w-3.5 h-3.5" /> Emoji
                </button>
              </div>
              {showEmoji && (
                <div className="mb-2">
                  <EmojiPicker
                    data={async () => (await import("@emoji-mart/data")).default}
                    onEmojiSelect={insertEmoji}
                    theme={isDark ? "dark" : "light"}
                    locale="es"
                    previewPosition="none"
                    skinTonePosition="none"
                  />
                </div>
              )}
              <textarea ref={textareaRef} className={`${inp} resize-none`} rows={4}
                value={descripcion} onChange={e => setDescripcion(e.target.value)} maxLength={1000} />
              <p className={`text-xs mt-1 text-right ${isDark ? "text-gray-600" : "text-gray-300"}`}>{descripcion.length}/1000</p>
            </div>

            {/* Fotos del evento */}
            <div>
              <label className={lab}><ImagePlus className="inline w-3 h-3 mr-1" />Fotos del evento</label>
              {evento.fotos.length > 0 && (
                <p className={`text-xs mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Ya tiene {evento.fotos.length} foto{evento.fotos.length > 1 ? "s" : ""}. Las nuevas se agregan a la galería.
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {/* Fotos existentes (solo vista) */}
                {evento.fotos.slice(0, 3).map((f, i) => (
                  <div key={`ex-${i}`} className="relative aspect-square rounded-xl overflow-hidden opacity-60">
                    <Image src={resolvePhotoUrl(f)} alt="" fill className="object-cover" />
                    {i === 2 && evento.fotos.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-bold">+{evento.fotos.length - 3}</div>
                    )}
                  </div>
                ))}
                {/* Fotos nuevas */}
                {newFotosPrev.map((src, i) => (
                  <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden">
                    <Image src={src} alt="" fill className="object-cover" />
                    <button type="button" onClick={() => removeFoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500/80">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {newFotos.length < 10 && (
                  <button type="button" onClick={() => fotosRef.current?.click()}
                    className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 ${
                      isDark ? "border-gray-700 text-gray-600 hover:border-gray-600" : "border-gray-200 text-gray-300 hover:border-gray-300"
                    }`}>
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-xs">Agregar</span>
                  </button>
                )}
              </div>
              <input ref={fotosRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => addFotos(e.target.files)} />
            </div>

            {/* Logo */}
            <div>
              <label className={lab}>Logo del organizador</label>
              <div className="flex items-center gap-3">
                {logoPrev && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                    <Image src={logoPrev} alt="logo" width={48} height={48} className="object-cover w-full h-full" />
                  </div>
                )}
                <button type="button" onClick={() => logoRef.current?.click()}
                  className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  <Upload className="w-3 h-3" />{logoPrev ? "Cambiar logo" : "Subir logo"}
                </button>
                <input ref={logoRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleImg(e.target.files[0], setLogoFile, setLogoPrev)} />
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          {/* Footer */}
          <div className={`flex-shrink-0 border-t px-4 py-4 flex gap-3 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            <button onClick={onClose}
              className={`px-5 py-3 rounded-2xl border text-sm font-medium ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : <><Check className="w-4 h-4" />Guardar cambios</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
