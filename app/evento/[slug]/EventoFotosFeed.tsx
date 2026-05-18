"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth, useUser } from "@clerk/nextjs";
import { Camera, Heart, Upload, Loader2, ImagePlus } from "lucide-react";
import { API_URL } from "@/lib/api/client";
import { resolvePhotoUrl } from "@/lib/utils/photo";

interface EventoFoto {
  id:          string;
  url:         string;
  autorNombre: string;
  likes:       number;
  createdAt:   string;
}

interface Props {
  slug:   string;
  isDark: boolean;
}

export function EventoFotosFeed({ slug, isDark }: Props) {
  const { isSignedIn } = useUser();
  const { getToken }   = useAuth();
  const fileRef        = useRef<HTMLInputElement>(null);

  const [fotos,    setFotos]    = useState<EventoFoto[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [uploading, setUploading] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const card   = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textMut = isDark ? "text-gray-400" : "text-gray-500";

  useEffect(() => {
    fetch(`${API_URL}/api/eventos/${slug}/fotos`)
      .then(r => r.ok ? r.json() : [])
      .then(setFotos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleUpload(file: File) {
    if (!file || uploading) return;
    setUploading(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("photo", file);
      fd.append("autorNombre", "Asistente");
      const res = await fetch(`${API_URL}/api/eventos/${slug}/fotos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token ?? ""}` },
        body: fd,
      });
      if (!res.ok) return;
      const nueva = await res.json() as EventoFoto;
      setFotos(prev => [nueva, ...prev]);
    } catch {}
    finally { setUploading(false); }
  }

  async function handleLikeFoto(fotoId: string) {
    if (likedIds.has(fotoId)) return;
    setLikedIds(prev => new Set([...prev, fotoId]));
    setFotos(prev => prev.map(f => f.id === fotoId ? { ...f, likes: f.likes + 1 } : f));
    try {
      await fetch(`${API_URL}/api/eventos/${slug}/fotos/${fotoId}/like`, { method: "POST" });
    } catch {}
  }

  if (loading) return (
    <div className={`rounded-2xl border p-5 ${card}`}>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4].map(i => <div key={i} className={`aspect-square rounded-xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />)}
      </div>
    </div>
  );

  return (
    <div className={`rounded-2xl border p-5 ${card}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-indigo-400" />
          <h2 className={`text-sm font-bold ${textPri}`}>
            Fotos del evento
            {fotos.length > 0 && <span className={`ml-1.5 font-normal ${textMut}`}>({fotos.length})</span>}
          </h2>
        </div>
        {isSignedIn && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-60 transition-colors"
          >
            {uploading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Subiendo...</>
              : <><ImagePlus className="w-3.5 h-3.5" />Subir foto</>
            }
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }}
        />
      </div>

      {!isSignedIn && fotos.length === 0 && (
        <div className={`py-10 text-center rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
          <Camera className={`w-10 h-10 mx-auto mb-2 ${textMut}`} />
          <p className={`text-sm font-semibold ${textPri}`}>Fotos de asistentes</p>
          <p className={`text-xs mt-1 ${textMut}`}>Iniciá sesión para subir tu foto del evento</p>
        </div>
      )}

      {fotos.length === 0 && isSignedIn && (
        <button
          onClick={() => fileRef.current?.click()}
          className={`w-full py-10 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-colors ${
            isDark ? "border-gray-700 text-gray-600 hover:border-indigo-500/50 hover:text-indigo-400"
                   : "border-gray-200 text-gray-300 hover:border-indigo-300 hover:text-indigo-400"
          }`}
        >
          <Upload className="w-8 h-8" />
          <span className="text-sm font-semibold">Sos el primero en subir una foto</span>
          <span className="text-xs">Tocá para abrir la camara</span>
        </button>
      )}

      {fotos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {fotos.map(foto => (
            <div key={foto.id} className={`rounded-2xl overflow-hidden relative group ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
              <div className="relative aspect-square">
                <Image
                  src={resolvePhotoUrl(foto.url)}
                  alt={`foto de ${foto.autorNombre}`}
                  fill
                  className="object-cover"
                />
                {/* Overlay con like */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={() => handleLikeFoto(foto.id)}
                  className={`absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all backdrop-blur-sm ${
                    likedIds.has(foto.id)
                      ? "bg-rose-500 text-white scale-110"
                      : "bg-black/40 text-white hover:bg-rose-500/80"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${likedIds.has(foto.id) ? "fill-current" : ""}`} />
                  {foto.likes > 0 && foto.likes}
                </button>
              </div>
              <div className={`px-2.5 py-2 flex items-center justify-between`}>
                <span className={`text-xs font-medium truncate ${textMut}`}>{foto.autorNombre}</span>
                <span className={`text-xs ${isDark ? "text-gray-600" : "text-gray-300"}`}>
                  {new Date(foto.createdAt).toLocaleDateString("es-AR", { day:"numeric", month:"short" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
