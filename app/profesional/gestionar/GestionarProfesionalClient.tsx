"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import {
  Camera, Trash2, ArrowLeft, Save, ToggleLeft, ToggleRight,
  ImagePlus, Loader2, CheckCircle2, ExternalLink, KeyRound, Eye, EyeOff,
} from "lucide-react";

import { API_URL } from "@/lib/api/client";
const STORAGE_KEY = "professional_panel_code";

interface Professional {
  id: string;
  nombre: string;
  apellido: string;
  slug: string;
  tipo: string | null;
  oficios: string[];
  descripcion: string | null;
  barrio: string | null;
  whatsapp: string | null;
  foto: string | null;
  fotos: string[];
  disponible: boolean;
}

function photoUrl(url?: string | null) {
  if (!url) return null;
  return url.startsWith("/uploads/") ? `${url}` : url;
}

export default function GestionarProfesionalClient() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();

  const [code, setCode] = useState<string | null>(null);
  const [clerkToken, setClerkToken] = useState<string | null>(null);
  const [waInput, setWaInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [pro, setPro] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingDisponible, setSavingDisponible] = useState(false);

  const [descripcion, setDescripcion] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [barrio, setBarrio] = useState("");

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [deletingFoto, setDeletingFoto] = useState<string | null>(null);

  const photoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const bg      = isDark ? "bg-gray-950" : "bg-gray-50";
  const card    = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";
  const textMut = isDark ? "text-gray-600" : "text-gray-400";
  const inputCls = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:border-blue-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500";

  // Build auth headers: Clerk token when signed in, X-Professional-Code otherwise.
  function buildHeaders(): Record<string, string> {
    if (code) return { "X-Professional-Code": code };
    if (clerkToken) return { Authorization: `Bearer ${clerkToken}` };
    return {};
  }

  // On mount: if signed in with Clerk, try to load the linked profile directly.
  // Otherwise fall back to the WhatsApp+PIN flow (localStorage code).
  useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      let cancelled = false;
      (async () => {
        try {
          const token = await getToken();
          if (cancelled) return;
          setClerkToken(token);
          const res = await fetch(`${API_URL}/api/professionals/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data: Professional = await res.json();
            if (cancelled) return;
            setPro(data);
            setDescripcion(data.descripcion ?? "");
            setWhatsapp(data.whatsapp ?? "");
            setBarrio(data.barrio ?? "");
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCode(saved);
    } else {
      setLoading(false);
    }
  }, [isLoaded, user, getToken]);

  // When code is set, load the profile
  useEffect(() => {
    if (!code) return;
    loadProfile(code);
  }, [code]);

  async function loadProfile(accessCode: string) {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/professionals/me`, {
        headers: { "X-Professional-Code": accessCode },
      });
      if (!res.ok) {
        localStorage.removeItem(STORAGE_KEY);
        setCode(null);
        setLoading(false);
        return;
      }
      const data: Professional = await res.json();
      setPro(data);
      setDescripcion(data.descripcion ?? "");
      setWhatsapp(data.whatsapp ?? "");
      setBarrio(data.barrio ?? "");
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    const wa = waInput.replace(/\D/g, "");
    const pin = pinInput.trim();
    if (!wa || !pin) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_URL}/api/professionals/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: wa, pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error ?? "Numero o PIN incorrecto.");
        return;
      }
      const { id } = await res.json();
      localStorage.setItem(STORAGE_KEY, id);
      setCode(id);
    } finally {
      setAuthLoading(false);
    }
  }

  async function saveInfo() {
    if (!pro || !code) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/professionals/me`, {
        method: "PUT",
        headers: { ...buildHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: pro.nombre, apellido: pro.apellido, tipo: pro.tipo,
          oficios: pro.oficios, descripcion: descripcion || null,
          barrio: barrio || null, whatsapp: whatsapp || null,
          disponible: pro.disponible, fotos: pro.fotos, foto: pro.foto,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPro(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleDisponible() {
    if (!pro || !code) return;
    setSavingDisponible(true);
    try {
      const res = await fetch(`${API_URL}/api/professionals/me`, {
        method: "PUT",
        headers: { ...buildHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: pro.nombre, apellido: pro.apellido, tipo: pro.tipo,
          oficios: pro.oficios, descripcion: pro.descripcion, barrio: pro.barrio,
          whatsapp: pro.whatsapp, disponible: !pro.disponible, fotos: pro.fotos, foto: pro.foto,
        }),
      });
      if (res.ok) setPro(await res.json());
    } finally {
      setSavingDisponible(false);
    }
  }

  async function uploadProfilePhoto(file: File) {
    if (!code) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch(`${API_URL}/api/professionals/me/photo`, {
        method: "POST", headers: buildHeaders(), body: fd,
      });
      if (res.ok) {
        const { foto } = await res.json();
        setPro((p) => p ? { ...p, foto } : p);
      }
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function uploadGalleryPhoto(file: File) {
    if (!code) return;
    setUploadingGallery(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch(`${API_URL}/api/professionals/me/fotos`, {
        method: "POST", headers: buildHeaders(), body: fd,
      });
      if (res.ok) {
        const { fotos } = await res.json();
        setPro((p) => p ? { ...p, fotos } : p);
      }
    } finally {
      setUploadingGallery(false);
    }
  }

  async function deleteGalleryPhoto(fotoUrl: string) {
    if (!code) return;
    setDeletingFoto(fotoUrl);
    try {
      const res = await fetch(`${API_URL}/api/professionals/me/fotos`, {
        method: "DELETE",
        headers: { ...buildHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ fotoUrl }),
      });
      if (res.ok) {
        const { fotos } = await res.json();
        setPro((p) => p ? { ...p, fotos } : p);
      }
    } finally {
      setDeletingFoto(null);
    }
  }

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ─── Auth form ──────────────────────────────────────────────────────────────
  if (!pro) {
    return (
      <div className={`min-h-screen ${bg} ${textPri}`}>
        <Navbar sidebarDisabled />
        <div className="max-w-sm mx-auto px-6 pt-28 pb-20 flex flex-col items-center gap-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? "bg-blue-500/20" : "bg-blue-50"}`}>
            <KeyRound className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-center">
            <h1 className={`text-xl font-bold mb-2 ${textPri}`}>Acceder a mi panel</h1>
            <p className={`text-sm ${textSec}`}>
              Ingresa tu WhatsApp y el PIN que elegiste al registrarte.
            </p>
          </div>

          <form onSubmit={handleAuth} className="w-full flex flex-col gap-3">
            <div>
              <label className={`text-xs mb-1.5 block ${textSec}`}>Numero de WhatsApp</label>
              <input
                value={waInput}
                onChange={(e) => { setWaInput(e.target.value); setAuthError(""); }}
                placeholder="3482 123456"
                inputMode="numeric"
                className={`w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none transition-colors ${inputCls}`}
              />
            </div>
            <div>
              <label className={`text-xs mb-1.5 block ${textSec}`}>PIN de 4 digitos</label>
              <div className="relative">
                <input
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4)); setAuthError(""); }}
                  placeholder="••••"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={4}
                  className={`w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none transition-colors pr-12 text-center text-2xl tracking-[0.5em] font-bold ${inputCls}`}
                />
                <button type="button" onClick={() => setShowPin(v => !v)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {authError && <p className="text-red-400 text-xs text-center">{authError}</p>}
            <button
              type="submit"
              disabled={!waInput.trim() || pinInput.length < 4 || authLoading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {authLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</> : "Ingresar"}
            </button>
          </form>

          <p className={`text-xs text-center ${textMut}`}>
            Una vez que ingras, este dispositivo te va a recordar. No vas a tener que volver a ingresar.
          </p>
        </div>
      </div>
    );
  }

  // ─── Panel ──────────────────────────────────────────────────────────────────
  const fotoSrc = photoUrl(pro.foto);

  return (
    <div className={`min-h-screen ${bg} ${textPri}`}>
      <Navbar sidebarDisabled />

      <div className="max-w-xl mx-auto px-4 pt-20 pb-32">

        <div className="flex items-center gap-3 mb-6 mt-2">
          <button onClick={() => router.back()} className={`p-2 rounded-xl ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-lg font-bold ${textPri}`}>Mi panel profesional</h1>
            <p className={`text-xs ${textSec}`}>{pro.nombre} {pro.apellido}</p>
          </div>
          <a
            href={`/profesional/${pro.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-colors ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver perfil
          </a>
        </div>

        {/* Disponibilidad */}
        <div className={`rounded-2xl border p-4 mb-4 flex items-center justify-between ${card}`}>
          <div>
            <p className={`text-sm font-semibold ${textPri}`}>Disponible para trabajos</p>
            <p className={`text-xs mt-0.5 ${textSec}`}>
              {pro.disponible ? "Apareces en busquedas" : "No apareces en busquedas"}
            </p>
          </div>
          <button onClick={toggleDisponible} disabled={savingDisponible} className="transition-opacity disabled:opacity-40">
            {pro.disponible
              ? <ToggleRight className="w-10 h-10 text-green-500" />
              : <ToggleLeft className={`w-10 h-10 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
            }
          </button>
        </div>

        {/* Foto de perfil */}
        <div className={`rounded-2xl border p-5 mb-4 ${card}`}>
          <p className={`text-sm font-semibold mb-4 ${textPri}`}>Foto de perfil</p>
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
              {fotoSrc
                ? <img src={fotoSrc} alt="Foto" className="w-full h-full object-cover" />
                : <div className={`w-full h-full flex items-center justify-center text-2xl font-bold ${isDark ? "text-gray-600" : "text-gray-300"}`}>{pro.nombre[0]}</div>
              }
            </div>
            <button
              onClick={() => photoRef.current?.click()}
              disabled={uploadingPhoto}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-40 ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {uploadingPhoto ? "Subiendo..." : "Cambiar foto"}
            </button>
            <input ref={photoRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadProfilePhoto(f); e.target.value = ""; }} />
          </div>
        </div>

        {/* Info editable */}
        <div className={`rounded-2xl border p-5 mb-4 ${card}`}>
          <p className={`text-sm font-semibold mb-4 ${textPri}`}>Informacion de contacto</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className={`text-xs mb-1.5 block ${textSec}`}>WhatsApp</label>
              <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="549342..."
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputCls}`} />
            </div>
            <div>
              <label className={`text-xs mb-1.5 block ${textSec}`}>Barrio / Zona</label>
              <input value={barrio} onChange={(e) => setBarrio(e.target.value)} placeholder="Ej: Reconquista Centro"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputCls}`} />
            </div>
            <div>
              <label className={`text-xs mb-1.5 block ${textSec}`}>Descripcion</label>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Contale a tus clientes quien sos y que haces..." rows={4}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors resize-none ${inputCls}`} />
            </div>
          </div>
          <button onClick={saveInfo} disabled={saving}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
              : saved ? <><CheckCircle2 className="w-4 h-4 text-green-300" /> Guardado!</>
              : <><Save className="w-4 h-4" /> Guardar cambios</>}
          </button>
        </div>

        {/* Galeria */}
        <div className={`rounded-2xl border p-5 mb-4 ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-sm font-semibold ${textPri}`}>Fotos de trabajos</p>
              <p className={`text-xs mt-0.5 ${textSec}`}>{pro.fotos.length} foto{pro.fotos.length !== 1 ? "s" : ""}</p>
            </div>
            <button onClick={() => galleryRef.current?.click()} disabled={uploadingGallery}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-40">
              {uploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
              {uploadingGallery ? "Subiendo..." : "Agregar foto"}
            </button>
            <input ref={galleryRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadGalleryPhoto(f); e.target.value = ""; }} />
          </div>

          {pro.fotos.length === 0 ? (
            <button onClick={() => galleryRef.current?.click()}
              className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${isDark ? "border-gray-700 hover:border-gray-500" : "border-gray-200 hover:border-gray-400"}`}>
              <ImagePlus className={`w-6 h-6 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
              <span className={`text-xs ${textSec}`}>Subi fotos de tus trabajos</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {pro.fotos.map((f) => {
                const src = photoUrl(f) ?? f;
                return (
                  <div key={f} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={src} alt="Trabajo" className="w-full h-full object-cover" />
                    <button onClick={() => deleteGalleryPhoto(f)} disabled={deletingFoto === f}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {deletingFoto === f
                        ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                        : <Trash2 className="w-5 h-5 text-white" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cerrar sesion del panel */}
        <button
          onClick={() => { localStorage.removeItem(STORAGE_KEY); setCode(null); setPro(null); }}
          className={`w-full py-3 rounded-2xl text-sm font-medium transition-colors ${isDark ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"}`}
        >
          Cerrar sesion del panel
        </button>

      </div>
    </div>
  );
}
