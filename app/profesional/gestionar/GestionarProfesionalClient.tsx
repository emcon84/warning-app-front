"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useTheme } from "../../contexts/ThemeContext";
import Navbar from "../../components/Navbar";
import {
  Camera, Trash2, ArrowLeft, Save, ToggleLeft, ToggleRight,
  ImagePlus, Loader2, CheckCircle2, ExternalLink,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  telefono: string | null;
  foto: string | null;
  fotos: string[];
  disponible: boolean;
}

function photoUrl(url?: string | null) {
  if (!url) return null;
  return url.startsWith("/uploads/") ? `${API}${url}` : url;
}

export default function GestionarProfesionalClient() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { isSignedIn, isLoaded } = useUser();
  const { isDark } = useTheme();

  const [pro, setPro] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
  const inputCls = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:border-blue-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500";

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.push("/"); return; }
    loadProfile();
  }, [isLoaded, isSignedIn]);

  async function loadProfile() {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/professionals/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) return;
      const data: Professional = await res.json();
      setPro(data);
      setDescripcion(data.descripcion ?? "");
      setWhatsapp(data.whatsapp ?? "");
      setBarrio(data.barrio ?? "");
    } finally {
      setLoading(false);
    }
  }

  async function saveInfo() {
    if (!pro) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/professionals/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: pro.nombre,
          apellido: pro.apellido,
          tipo: pro.tipo,
          oficios: pro.oficios,
          descripcion: descripcion || null,
          barrio: barrio || null,
          whatsapp: whatsapp || null,
          disponible: pro.disponible,
          fotos: pro.fotos,
          foto: pro.foto,
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
    if (!pro) return;
    setSavingDisponible(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/professionals/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: pro.nombre, apellido: pro.apellido, tipo: pro.tipo,
          oficios: pro.oficios, descripcion: pro.descripcion, barrio: pro.barrio,
          whatsapp: pro.whatsapp, disponible: !pro.disponible, fotos: pro.fotos, foto: pro.foto,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPro(updated);
      }
    } finally {
      setSavingDisponible(false);
    }
  }

  async function uploadProfilePhoto(file: File) {
    setUploadingPhoto(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch(`${API}/api/professionals/me/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
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
    setUploadingGallery(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch(`${API}/api/professionals/me/fotos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
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
    setDeletingFoto(fotoUrl);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/professionals/me/fotos`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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

  if (!isLoaded || loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={`min-h-screen ${bg} ${textPri} flex flex-col items-center justify-center gap-4 px-6`}>
        <p className={`text-sm ${textSec}`}>No tenés un perfil profesional registrado.</p>
        <button
          onClick={() => router.push("/profesional/nuevo")}
          className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-sm font-semibold"
        >
          Crear mi perfil profesional
        </button>
      </div>
    );
  }

  if (!pro) return null;

  const fotoSrc = photoUrl(pro.foto);

  return (
    <div className={`min-h-screen ${bg} ${textPri}`}>
      <Navbar sidebarDisabled />

      <div className="max-w-xl mx-auto px-4 pt-20 pb-32">

        {/* Header */}
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
              {pro.disponible ? "Aparecés en búsquedas" : "No aparecés en búsquedas"}
            </p>
          </div>
          <button
            onClick={toggleDisponible}
            disabled={savingDisponible}
            className="transition-opacity disabled:opacity-40"
          >
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
                : <div className={`w-full h-full flex items-center justify-center text-2xl font-bold ${isDark ? "text-gray-600" : "text-gray-300"}`}>
                    {pro.nombre[0]}
                  </div>
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
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadProfilePhoto(f); e.target.value = ""; }}
            />
          </div>
        </div>

        {/* Info editable */}
        <div className={`rounded-2xl border p-5 mb-4 ${card}`}>
          <p className={`text-sm font-semibold mb-4 ${textPri}`}>Informacion de contacto</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className={`text-xs mb-1.5 block ${textSec}`}>WhatsApp</label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ej: 549342..."
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputCls}`}
              />
            </div>
            <div>
              <label className={`text-xs mb-1.5 block ${textSec}`}>Barrio / Zona</label>
              <input
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                placeholder="Ej: Reconquista Centro"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputCls}`}
              />
            </div>
            <div>
              <label className={`text-xs mb-1.5 block ${textSec}`}>Descripcion</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Contale a tus clientes quién sos y qué hacés..."
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors resize-none ${inputCls}`}
              />
            </div>
          </div>

          <button
            onClick={saveInfo}
            disabled={saving}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
              : saved
              ? <><CheckCircle2 className="w-4 h-4 text-green-300" /> Guardado!</>
              : <><Save className="w-4 h-4" /> Guardar cambios</>
            }
          </button>
        </div>

        {/* Galeria de trabajos */}
        <div className={`rounded-2xl border p-5 mb-4 ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-sm font-semibold ${textPri}`}>Fotos de trabajos</p>
              <p className={`text-xs mt-0.5 ${textSec}`}>{pro.fotos.length} foto{pro.fotos.length !== 1 ? "s" : ""}</p>
            </div>
            <button
              onClick={() => galleryRef.current?.click()}
              disabled={uploadingGallery}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-40"
            >
              {uploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
              {uploadingGallery ? "Subiendo..." : "Agregar foto"}
            </button>
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadGalleryPhoto(f); e.target.value = ""; }}
            />
          </div>

          {pro.fotos.length === 0 ? (
            <button
              onClick={() => galleryRef.current?.click()}
              className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${isDark ? "border-gray-700 hover:border-gray-500" : "border-gray-200 hover:border-gray-400"}`}
            >
              <ImagePlus className={`w-6 h-6 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
              <span className={`text-xs ${textSec}`}>Subí fotos de tus trabajos</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {pro.fotos.map((f) => {
                const src = photoUrl(f) ?? f;
                const deleting = deletingFoto === f;
                return (
                  <div key={f} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={src} alt="Trabajo" className="w-full h-full object-cover" />
                    <button
                      onClick={() => deleteGalleryPhoto(f)}
                      disabled={deleting}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      {deleting
                        ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                        : <Trash2 className="w-5 h-5 text-white" />
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
