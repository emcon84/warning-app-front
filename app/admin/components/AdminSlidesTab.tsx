"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useTheme } from "@/contexts/ThemeContext";
import { API_URL } from "@/lib/api/client";
import type { HeroSlideItem } from "../types";
import { RefreshCw, Pin, PinOff, Trash2, Upload, Image as ImageIcon, Plus } from "lucide-react";

interface AdminSlideRow extends HeroSlideItem {
  refExists?: boolean | null;
  refName?: string | null;
  updatedAt: string;
}

export function AdminSlidesTab() {
  const { getToken } = useAuth();
  const { isDark } = useTheme();
  const bgCard = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const bgInput = isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-600" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400";
  const bgBtn = isDark ? "bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:bg-gray-700" : "bg-white text-gray-600 border-gray-300 hover:text-gray-900 hover:bg-gray-50";
  const bgSelect = isDark ? "bg-gray-800 text-gray-400 border-gray-700" : "bg-white text-gray-600 border-gray-300";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted = isDark ? "text-gray-500" : "text-gray-400";
  const textDim = isDark ? "text-gray-600" : "text-gray-500";
  const textExtra = isDark ? "text-gray-700" : "text-gray-400";
  const fileInput = isDark ? "file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700" : "file:bg-gray-100 file:text-gray-500 hover:file:bg-gray-200";
  const bgPreview = isDark ? "bg-gray-800" : "bg-gray-200";
  const btnRed = isDark ? "bg-red-900/30 text-red-400 border-red-800/50 hover:bg-red-900/60" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100";
  const btnAmber = isDark ? "bg-amber-900/30 text-amber-400 border-amber-800/50 hover:bg-amber-900/60" : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100";
  const badgeRed = isDark ? "bg-red-900/40 text-red-400 border-red-800/50" : "bg-red-50 text-red-600 border-red-200";
  const badgeAmber = isDark ? "bg-amber-900/40 text-amber-300 border-amber-800/50" : "bg-amber-50 text-amber-600 border-amber-200";
  const badgeIndigo = isDark ? "bg-indigo-900/40 text-indigo-300 border-indigo-800/50" : "bg-indigo-50 text-indigo-600 border-indigo-200";
  const badgePurple = isDark ? "bg-purple-900/40 text-purple-300 border-purple-800/50" : "bg-purple-50 text-purple-600 border-purple-200";

  const [slides, setSlides] = useState<AdminSlideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);

  // Background image upload per slide
  const [bgUploadingId, setBgUploadingId] = useState<string | null>(null);

  // Background image URL input per slide
  const [bgUrlInputs, setBgUrlInputs] = useState<Record<string, string>>({});

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formCtaText, setFormCtaText] = useState("");
  const [formCtaUrl, setFormCtaUrl] = useState("");
  const [formStartsAt, setFormStartsAt] = useState("");
  const [formEndsAt, setFormEndsAt] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { loadSlides(); }, []);

  async function loadSlides() {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/admin/hero-slides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSlides(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleRecalculate() {
    if (!confirm("¿Recalcular ranking de slides? Se van a regenerar los slides automáticos de profesionales y comercios según el ranking Bayesian.")) return;
    setRecalculating(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/cron/recalculate-hero-slides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        await loadSlides();
        alert(`Ranking recalculado: ${data.createdSlides ?? 0} slides creados, ${data.orphansRemoved ?? 0} huérfanos eliminados.`);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Error al recalcular ranking (verificá que CRON_API_KEY esté configurado en el backend)");
      }
    } finally {
      setRecalculating(false);
    }
  }

  async function handleTogglePin(slide: AdminSlideRow) {
    setTogglingId(slide.id);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/admin/hero-slides/${slide.id}/pin`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !slide.isPinned }),
      });
      if (res.ok) {
        setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, isPinned: !s.isPinned } : s));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Error al cambiar pin");
      }
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(slide: AdminSlideRow) {
    if (!confirm(`¿Eliminar slide "${slide.title}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(slide.id);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/admin/hero-slides/${slide.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSlides(prev => prev.filter(s => s.id !== slide.id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Error al eliminar slide");
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUploadBg(slide: AdminSlideRow, file: File) {
    setBgUploadingId(slide.id);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}/api/admin/hero-slides/${slide.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        await loadSlides();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Error al subir imagen de fondo");
      }
    } finally {
      setBgUploadingId(null);
    }
  }

  async function handleClearBg(slide: AdminSlideRow) {
    if (!confirm(`¿Quitar la imagen de fondo de "${slide.title}"?`)) return;
    setBgUploadingId(slide.id);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/admin/hero-slides/${slide.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: null }),
      });
      if (res.ok) {
        await loadSlides();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Error al quitar fondo");
      }
    } finally {
      setBgUploadingId(null);
    }
  }

  async function handleSetBgUrl(slide: AdminSlideRow) {
    const url = bgUrlInputs[slide.id]?.trim();
    if (!url) return;
    setBgUploadingId(slide.id);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/admin/hero-slides/${slide.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });
      if (res.ok) {
        await loadSlides();
        setBgUrlInputs(prev => {
          const next = { ...prev };
          delete next[slide.id];
          return next;
        });
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Error al establecer URL de fondo");
      }
    } finally {
      setBgUploadingId(null);
    }
  }

  async function handleSetPosition(slide: AdminSlideRow, position: string) {
    setBgUploadingId(slide.id);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/admin/hero-slides/${slide.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imagePosition: position }),
      });
      if (res.ok) {
        await loadSlides();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Error al cambiar posición de imagen");
      }
    } finally {
      setBgUploadingId(null);
    }
  }

  async function handleCreatePromo() {
    if (!formTitle.trim()) {
      alert("El título es obligatorio");
      return;
    }
    setUploading(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("title", formTitle.trim());
      if (formSubtitle.trim()) fd.append("subtitle", formSubtitle.trim());
      if (formCtaText.trim()) fd.append("ctaText", formCtaText.trim());
      if (formCtaUrl.trim()) fd.append("ctaUrl", formCtaUrl.trim());
      if (formStartsAt) fd.append("startsAt", formStartsAt);
      if (formEndsAt) fd.append("endsAt", formEndsAt);
      if (formFile) fd.append("file", formFile);

      const res = await fetch(`${API_URL}/api/admin/hero-slides`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (res.ok) {
        await loadSlides();
        resetForm();
        setShowForm(false);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Error al crear promo slide");
      }
    } finally {
      setUploading(false);
    }
  }

  function resetForm() {
    setFormTitle("");
    setFormSubtitle("");
    setFormCtaText("");
    setFormCtaUrl("");
    setFormStartsAt("");
    setFormEndsAt("");
    setFormFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function slideTypeBadge(type: string) {
    switch (type) {
      case "professional":
        return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeIndigo}`}>Profesional</span>;
      case "comercio":
        return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeAmber}`}>Comercio</span>;
      case "promo":
        return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgePurple}`}>Promo</span>;
      default:
        return null;
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("es-AR", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  // ── Loading skeleton ────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-16 rounded-2xl ${bgCard} animate-pulse`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Recalcular button ──────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${recalculating ? "animate-spin" : ""}`} />
          {recalculating ? "Recalculando..." : "Recalcular ranking"}
        </button>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            showForm
              ? `${isDark ? "bg-gray-700" : "bg-gray-300"} ${textPrimary}`
              : `${isDark ? "bg-gray-900 border-gray-800 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-500"} ${isDark ? "hover:text-white" : "hover:text-gray-900"}`
          }`}
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancelar" : "Agregar promo"}
        </button>
      </div>

      {/* ── Add Promo Slide Form ───────────────────────────────── */}
      {showForm && (
        <div className={`p-5 rounded-2xl border ${bgCard} space-y-4`}>
          <div className="flex items-center gap-2 mb-1">
            <Plus className="w-4 h-4 text-purple-400" />
            <p className={`text-sm font-bold ${textPrimary}`}>Nuevo slide promocional</p>
          </div>

          <div>
            <label className={`text-xs ${textMuted} mb-1.5 block`}>
              Imagen <span className={`${textExtra}`}>(recomendado: 1200×600px)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={e => setFormFile(e.target.files?.[0] ?? null)}
                className={`text-xs ${textSecondary} file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold ${fileInput} flex-1`}
              />
              {formFile && (
                <span className="text-xs text-gray-500 truncate max-w-[120px]">{formFile.name}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs ${textMuted} mb-1.5 block`}>Título *</label>
              <input
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Ej: Oferta de la semana"
                className={`w-full px-3 py-2.5 rounded-xl ${bgInput} text-sm focus:outline-none focus:border-gray-500`}
              />
            </div>
            <div>
              <label className={`text-xs ${textMuted} mb-1.5 block`}>
                Subtítulo <span className={`${textExtra}`}>(opcional)</span>
              </label>
              <input
                value={formSubtitle}
                onChange={e => setFormSubtitle(e.target.value)}
                placeholder="Ej: Descuentos especiales por tiempo limitado"
                className={`w-full px-3 py-2.5 rounded-xl ${bgInput} text-sm focus:outline-none focus:border-gray-500`}
              />
            </div>
            <div>
              <label className={`text-xs ${textMuted} mb-1.5 block`}>
                Texto del botón <span className={`${textExtra}`}>(opcional)</span>
              </label>
              <input
                value={formCtaText}
                onChange={e => setFormCtaText(e.target.value)}
                placeholder="Ej: Ver oferta"
                className={`w-full px-3 py-2.5 rounded-xl ${bgInput} text-sm focus:outline-none focus:border-gray-500`}
              />
            </div>
            <div>
              <label className={`text-xs ${textMuted} mb-1.5 block`}>
                URL del botón <span className={`${textExtra}`}>(opcional)</span>
              </label>
              <input
                value={formCtaUrl}
                onChange={e => setFormCtaUrl(e.target.value)}
                placeholder="Ej: /comercio/mi-tienda"
                className={`w-full px-3 py-2.5 rounded-xl ${bgInput} text-sm focus:outline-none focus:border-gray-500`}
              />
            </div>
            <div>
              <label className={`text-xs ${textMuted} mb-1.5 block`}>
                Inicia <span className={`${textExtra}`}>(opcional)</span>
              </label>
              <input
                type="datetime-local"
                value={formStartsAt}
                onChange={e => setFormStartsAt(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl ${bgInput} text-sm focus:outline-none focus:border-gray-500`}
              />
            </div>
            <div>
              <label className={`text-xs ${textMuted} mb-1.5 block`}>
                Finaliza <span className={`${textExtra}`}>(opcional)</span>
              </label>
              <input
                type="datetime-local"
                value={formEndsAt}
                onChange={e => setFormEndsAt(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl ${bgInput} text-sm focus:outline-none focus:border-gray-500`}
              />
            </div>
          </div>

          <button
            onClick={handleCreatePromo}
            disabled={uploading || !formTitle.trim()}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Creando slide...</>
            ) : (
              <><Upload className="w-4 h-4" /> Crear slide promocional</>
            )}
          </button>
        </div>
      )}

      {/* ── Slides table ────────────────────────────────────────── */}
      {slides.length === 0 ? (
        <p className={`text-sm ${textDim} text-center py-8`}>No hay slides. Hacé click en "Recalcular ranking" o creá un slide promocional.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {slides.map(slide => (
            <div
              key={slide.id}
              className={`flex items-center gap-3 p-4 rounded-2xl border ${bgCard}`}
            >
              {/* Preview */}
              <div className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 ${bgPreview} flex items-center justify-center`}>
                {slide.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className={`w-5 h-5 ${textDim}`} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {slideTypeBadge(slide.slideType)}
                  <span className={`font-semibold text-sm ${textPrimary} truncate`}>{slide.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {slide.subtitle && (
                    <p className={`text-xs ${textSecondary} truncate`}>{slide.subtitle}</p>
                  )}
                  {slide.refName && (
                    <span className={`text-[11px] ${textDim}`}>ref: {slide.refName}</span>
                  )}
                  {slide.refExists === false && (
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${badgeRed}`}>Huérfano</span>
                  )}
                </div>
                <p className={`text-[11px] ${textDim} mt-0.5`}>
                  Orden: {slide.sortOrder} · Creado: {formatDate(slide.createdAt)}
                  {slide.startsAt && ` · Inicia: ${formatDate(slide.startsAt)}`}
                  {slide.endsAt && ` · Finaliza: ${formatDate(slide.endsAt)}`}
                </p>
                {/* URL image input */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    value={bgUrlInputs[slide.id] ?? slide.imageUrl ?? ""}
                    onChange={e => setBgUrlInputs(prev => ({ ...prev, [slide.id]: e.target.value }))}
                    placeholder="URL de imagen de fondo (https://...)"
                    className={`flex-1 px-2.5 py-1.5 rounded-lg ${bgInput} text-xs focus:outline-none focus:border-gray-500`}
                  />
                  <button
                    onClick={() => handleSetBgUrl(slide)}
                    disabled={bgUploadingId === slide.id || !(bgUrlInputs[slide.id]?.trim() ?? "")}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40 flex items-center gap-1"
                  >
                    {bgUploadingId === slide.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      "Establecer"
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Background image upload */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadBg(slide, file);
                      e.target.value = "";
                    }}
                    className="hidden"
                    id={`bg-${slide.id}`}
                  />
                  <label
                    htmlFor={`bg-${slide.id}`}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors border cursor-pointer ${
                      bgUploadingId === slide.id
                        ? "bg-indigo-900/30 text-indigo-400 border-indigo-800/50 pointer-events-none"
                        : `${bgBtn}`
                    }`}
                    title={slide.imageUrl ? "Cambiar fondo" : "Subir fondo"}
                  >
                    {bgUploadingId === slide.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5" />
                    )}
                  </label>
                </div>
                {slide.imageUrl && (
                  <button
                    onClick={() => handleClearBg(slide)}
                    disabled={bgUploadingId === slide.id}
                    className={`p-2 rounded-xl border ${bgBtn} hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-40`}
                    title="Quitar fondo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {slide.imageUrl && (
                  <select
                    value={slide.imagePosition ?? "center"}
                    onChange={e => handleSetPosition(slide, e.target.value)}
                    disabled={bgUploadingId === slide.id}
                    className={`p-2 rounded-xl ${bgSelect} text-[11px] border focus:outline-none focus:border-gray-500 disabled:opacity-40 cursor-pointer`}
                    title="Posición de imagen"
                  >
                    <option value="center">Centro</option>
                    <option value="top">Superior</option>
                    <option value="bottom">Inferior</option>
                  </select>
                )}
                <button
                  onClick={() => handleTogglePin(slide)}
                  disabled={togglingId === slide.id}
                  className={`p-2 rounded-xl text-xs font-medium transition-colors border ${
                    slide.isPinned
                      ? `${btnAmber}`
                      : `${bgBtn}`
                  } disabled:opacity-40`}
                  title={slide.isPinned ? "Despinear" : "Pinear"}
                >
                  {slide.isPinned ? <Pin className="w-3.5 h-3.5 fill-amber-400" /> : <PinOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDelete(slide)}
                  disabled={deletingId === slide.id}
                  className={`p-2 rounded-xl border ${btnRed} transition-colors disabled:opacity-40`}
                  title="Eliminar"
                >
                  {deletingId === slide.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
