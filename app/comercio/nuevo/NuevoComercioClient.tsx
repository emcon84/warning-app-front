"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Navbar from "../../components/Navbar";
import { Bell, CheckCircle, X } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useTheme } from "../../contexts/ThemeContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const BARRIOS = [
  "Reconquista (toda la ciudad)",
  "Centro", "Barrio Norte", "Barrio Sur", "Barrio Oeste", "Villa del Parque",
  "Las Lomas", "Parque Industrial", "Barrio Newbery", "Villa Ocampo",
  "Los Lapachos", "San Cayetano", "Otro",
];

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

// ─── Step 4: Notificaciones ──────────────────────────────────────────────────

function Step4Notificaciones({
  isDark,
  permission,
  isSupported,
  requestPermission,
  onFinish,
}: {
  isDark: boolean;
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  onFinish: () => void;
}) {
  const [activating, setActivating] = useState(false);
  const [success, setSuccess] = useState(false);

  const textSec = isDark ? "text-gray-400" : "text-gray-500";
  const btnSecondary = isDark
    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
    : "bg-gray-100 text-gray-600 hover:bg-gray-200";

  useEffect(() => {
    if (success || permission === "granted") {
      const t = setTimeout(onFinish, 1500);
      return () => clearTimeout(t);
    }
  }, [success, permission, onFinish]);

  async function handleActivar() {
    setActivating(true);
    const granted = await requestPermission();
    setActivating(false);
    if (granted) setSuccess(true);
  }

  if (success || permission === "granted") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className={`w-16 h-16 rounded-full border flex items-center justify-center ${
          isDark ? "bg-green-900/40 border-green-700" : "bg-green-100 border-green-300"
        }`}>
          <CheckCircle className={`w-8 h-8 ${isDark ? "text-green-400" : "text-green-600"}`} />
        </div>
        <p className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>Notificaciones activadas</p>
        <p className={`text-sm text-center ${textSec}`}>Te vamos a avisar cuando un cliente te consulte.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center text-center mb-8">
        <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-4 ${
          isDark ? "bg-blue-950/60 border-blue-800" : "bg-blue-50 border-blue-200"
        }`}>
          <Bell className={`w-8 h-8 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
        </div>
        <h1 className={`text-xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Activa las notificaciones</h1>
        <p className={`text-sm ${textSec}`}>Para saber cuando un cliente te consulta</p>
      </div>

      {!isSupported && (
        <p className={`text-xs text-center mb-6 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Tu navegador no soporta notificaciones push. Podras activarlas despues desde tu perfil.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {isSupported && (
          <button
            onClick={handleActivar}
            disabled={activating}
            className="w-full py-3.5 rounded-2xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-60"
          >
            {activating ? "Activando..." : "Activar notificaciones"}
          </button>
        )}
        <button
          onClick={onFinish}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-colors ${btnSecondary}`}
        >
          Omitir por ahora
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NuevoComercioClient() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { permission, isSupported, requestPermission } = useNotifications();

  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");

  // Step 1 fields
  const [form, setForm] = useState({
    nombre: "",
    rubro: "",
    barrio: "",
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


  const bg           = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary  = isDark ? "text-white" : "text-gray-900";
  const textSec      = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted    = isDark ? "text-gray-600" : "text-gray-400";
  const inputCls     = isDark
    ? "bg-gray-900 border-gray-700 placeholder-gray-500 focus:border-gray-500"
    : "bg-white border-gray-200 placeholder-gray-400 focus:border-gray-400";
  const inputColor   = isDark ? "#f9fafb" : "#111827";
  const inputBg      = isDark ? "#111827" : "#ffffff";
  const btnSecondary = isDark
    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200";
  const stepFuture   = isDark ? "bg-gray-800 text-gray-500" : "bg-gray-200 text-gray-400";
  const stepLine     = isDark ? "bg-gray-700" : "bg-gray-200";
  const errorCls     = isDark
    ? "text-red-400 bg-red-900/20 border-red-800"
    : "text-red-600 bg-red-50 border-red-300";

  // WhatsApp formatting (same as NuevoProfesionalClient)
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
    } catch (e: any) {
      setError(e.message || "No se pudo generar la descripcion. Intenta de nuevo.");
    } finally {
      setAiLoading(false);
    }
  }

  function handleMainPhoto(file: File | null) {
    setMainPhoto(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setMainPreview(url);
    } else {
      setMainPreview(null);
    }
  }

  function handleGalleryAdd(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 6 - gallery.length);
    setGallery((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
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
      setStep(4);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const canGoStep2 = form.nombre.trim() && form.rubro && form.barrio && form.whatsapp.length >= 11;
  const canGoStep3 = true; // step 2 fields are optional-ish (direccion, horario required-ish but descripcion can be empty)
  const canSubmit  = !loading;

  return (
    <div className={`min-h-screen ${bg} ${textPrimary} flex flex-col`}>
      <Navbar sidebarDisabled />

      <div className="flex-1 max-w-xl mx-auto w-full px-4 pt-24 pb-40">

        {/* Progress */}
        <div className="flex items-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                s < step  ? "bg-green-500 text-white" :
                s === step ? (isDark ? "bg-white text-gray-900" : "bg-gray-900 text-white") :
                stepFuture
              }`}>
                {s < step ? "✓" : s}
              </div>
              {s < 4 && <div className={`h-px flex-1 mx-2 transition-colors ${s < step ? "bg-green-500" : stepLine}`} />}
            </Fragment>
          ))}
        </div>

        {/* ── Step 1: Datos del comercio ─────────────────────────────── */}
        {step === 1 && (
          <div key={1} className="animate-step-enter">
            <h1 className={`text-xl font-bold mb-1 ${textPrimary}`}>Tu comercio</h1>
            <p className={`text-sm mb-6 ${textSec}`}>Los datos principales que van a ver tus clientes.</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>Nombre del comercio</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Almacén El Cruce"
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                />
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>Rubro</label>
                <select
                  value={form.rubro}
                  onChange={(e) => setForm((f) => ({ ...f, rubro: e.target.value }))}
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                >
                  <option value="">Selecciona un rubro</option>
                  {RUBROS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>Barrio</label>
                <select
                  value={form.barrio}
                  onChange={(e) => setForm((f) => ({ ...f, barrio: e.target.value }))}
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                >
                  <option value="">Selecciona un barrio</option>
                  {BARRIOS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>WhatsApp</label>
                <input
                  value={whatsappRaw}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                  placeholder="Ej: 3482 123456"
                  inputMode="numeric"
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                />
                {form.whatsapp.length >= 11 && (
                  <p className={`text-xs mt-1.5 ${isDark ? "text-green-400" : "text-green-600"}`}>
                    Listo: wa.me/{form.whatsapp}
                  </p>
                )}
                {whatsappRaw && form.whatsapp.length < 11 && (
                  <p className={`text-xs mt-1.5 ${isDark ? "text-yellow-500" : "text-yellow-600"}`}>
                    Numero incompleto.
                  </p>
                )}
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>
                  Telefono <span className={textMuted}>(opcional)</span>
                </label>
                <input
                  value={form.telefono}
                  onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                  placeholder="03482-XXXXXX"
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canGoStep2}
              className="w-full mt-8 py-3.5 rounded-2xl bg-white text-gray-900 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              Continuar
            </button>
          </div>
        )}

        {/* ── Step 2: Descripcion e info ─────────────────────────────── */}
        {step === 2 && (
          <div key={2} className="animate-step-enter">
            <h1 className={`text-xl font-bold mb-1 ${textPrimary}`}>Info del local</h1>
            <p className={`text-sm mb-6 ${textSec}`}>Donde estan y como los encontran los clientes.</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>
                  Direccion <span className={textMuted}>(opcional)</span>
                </label>
                <input
                  value={form.direccion}
                  onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                  placeholder="Ej: San Martín 1234"
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                />
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>
                  Horario <span className={textMuted}>(opcional)</span>
                </label>
                <input
                  value={form.horario}
                  onChange={(e) => setForm((f) => ({ ...f, horario: e.target.value }))}
                  placeholder="Ej: Lunes a Viernes 9 a 18hs, Sabados 9 a 13hs"
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                />
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>
                  Descripcion <span className={textMuted}>({form.descripcion.length}/500)</span>
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value.slice(0, 500) }))}
                  placeholder="Conta que venden, que los diferencia, si tienen delivery, etc."
                  rows={5}
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none ${inputCls}`}
                />
                {form.descripcion.length > 0 && form.descripcion.length < 30 && (
                  <p className="text-xs text-yellow-600 mt-1">Minimo 30 caracteres.</p>
                )}

                {/* Generar con IA */}
                {!aiOpen ? (
                  <button
                    type="button"
                    onClick={() => setAiOpen(true)}
                    className={`mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors ${
                      isDark
                        ? "border-purple-800 text-purple-400 hover:bg-purple-900/30"
                        : "border-purple-300 text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    <span>✦</span> Generar con IA
                  </button>
                ) : (
                  <div className={`mt-3 p-3 rounded-xl border ${isDark ? "border-purple-800 bg-purple-950/30" : "border-purple-200 bg-purple-50"}`}>
                    <p className={`text-xs font-medium mb-2 ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                      Una pregunta rapida y la IA escribe el borrador
                    </p>
                    <input
                      value={aiExtra.zona}
                      onChange={(e) => setAiExtra({ zona: e.target.value })}
                      placeholder="Zonas donde entregan / donde atienden (opcional)"
                      style={{ color: inputColor, backgroundColor: inputBg }}
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={handleGenerarDescripcion}
                        disabled={aiLoading}
                        className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
                      >
                        {aiLoading ? "Generando..." : "Generar descripcion"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiOpen(false)}
                        className={`px-3 py-2 rounded-xl text-xs border transition-colors ${btnSecondary}`}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className={`flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-colors border ${btnSecondary}`}
              >
                Atras
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canGoStep3}
                className="flex-1 py-3.5 rounded-2xl bg-white text-gray-900 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Fotos ──────────────────────────────────────────── */}
        {step === 3 && (
          <div key={3} className="animate-step-enter">
            <h1 className={`text-xl font-bold mb-1 ${textPrimary}`}>Fotos del local</h1>
            <p className={`text-sm mb-6 ${textSec}`}>
              Subí fotos de tu local, productos o servicios. Los clientes confian mas en los comercios con buenas fotos.
            </p>

            {/* Foto principal */}
            <div className="mb-6">
              <label className={`text-xs mb-2 block ${textSec}`}>Logo o foto principal</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => mainPhotoRef.current?.click()}
                  className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${
                    isDark
                      ? "border-gray-700 hover:border-gray-500 bg-gray-900"
                      : "border-gray-300 hover:border-gray-400 bg-gray-100"
                  }`}
                >
                  {mainPreview ? (
                    <img src={mainPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className={`text-3xl ${textMuted}`}>+</span>
                  )}
                </button>
                <div>
                  <p className={`text-sm font-medium ${textPrimary}`}>
                    {mainPreview ? "Foto seleccionada" : "Sin foto aun"}
                  </p>
                  <p className={`text-xs mt-1 ${textMuted}`}>Circular, recomendado 400x400px</p>
                  {mainPreview && (
                    <button
                      type="button"
                      onClick={() => { setMainPhoto(null); setMainPreview(null); }}
                      className={`text-xs mt-1 ${isDark ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-400"}`}
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

            {/* Galeria */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs ${textSec}`}>
                  Galeria <span className={textMuted}>({gallery.length}/6)</span>
                </label>
                {gallery.length < 6 && (
                  <button
                    type="button"
                    onClick={() => galleryRef.current?.click()}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${btnSecondary}`}
                  >
                    + Agregar fotos
                  </button>
                )}
              </div>

              {gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {galleryPreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square">
                      <div className={`w-full h-full rounded-xl overflow-hidden border ${isDark ? "border-gray-800" : "border-gray-200"}`}>
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
                  className={`w-full py-10 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-colors ${
                    isDark
                      ? "border-gray-700 hover:border-gray-500 text-gray-500"
                      : "border-gray-300 hover:border-gray-400 text-gray-400"
                  }`}
                >
                  <span className="text-3xl">+</span>
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
              <p className={`mb-4 text-sm border rounded-xl px-4 py-3 ${errorCls}`}>{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className={`flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-colors border ${btnSecondary}`}
              >
                Atras
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-1 py-3.5 rounded-2xl bg-white text-gray-900 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                {loading ? "Publicando..." : "Publicar comercio"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Notificaciones ─────────────────────────────────── */}
        {step === 4 && (
          <Step4Notificaciones
            isDark={isDark}
            permission={permission}
            isSupported={isSupported}
            requestPermission={requestPermission}
            onFinish={() => router.push(`/comercio/${createdSlug}`)}
          />
        )}

      </div>
    </div>
  );
}
