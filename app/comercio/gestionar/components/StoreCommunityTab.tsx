"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ImageIcon, Megaphone, Trash2, X } from "lucide-react";
import ComercioPostCard from "../../../components/ComercioPostCard";
import NuevoPostWizard from "../NuevoPostWizard";
import type { ComercioPost } from "../../../types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Props {
  comercio: { id: string; nombre: string; slug: string };
  isDark: boolean;
  getToken: () => Promise<string | null>;
}

export function StoreCommunityTab({ comercio, isDark, getToken }: Props) {
  const [posts, setPosts] = useState<ComercioPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [postTipo, setPostTipo] = useState<"novedad" | "oferta" | "sorteo">("novedad");
  const [postContenido, setPostContenido] = useState("");
  const [postFoto, setPostFoto] = useState<File | null>(null);
  const [postFotoPreview, setPostFotoPreview] = useState<string | null>(null);
  const [postPrecioAntes, setPostPrecioAntes] = useState("");
  const [postPrecioDespues, setPostPrecioDespues] = useState("");
  const [postFechaSorteo, setPostFechaSorteo] = useState("");
  const [saving, setSaving] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const inputCls = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-gray-500"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400";

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/comercios/${comercio.slug}/posts?limit=20`)
      .then((r) => r.json())
      .then((d) => { if (d.posts) setPosts(d.posts); })
      .catch(() => { /**/ })
      .finally(() => setLoading(false));
  }, [comercio.slug]);

  async function handlePublicar() {
    if (!postContenido.trim()) return;
    setSaving(true);
    setPostError(null);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("tipo", postTipo);
      fd.append("contenido", postContenido.trim());
      if (postFoto) fd.append("photo", postFoto);
      if (postTipo === "oferta") {
        if (postPrecioAntes) fd.append("precioAntes", postPrecioAntes);
        if (postPrecioDespues) fd.append("precioDespues", postPrecioDespues);
      }
      if (postTipo === "sorteo" && postFechaSorteo) fd.append("fechaSorteo", postFechaSorteo);
      const res = await fetch(`${API}/api/comercios/${comercio.slug}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("error");
      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]);
      setPostContenido("");
      setPostFoto(null);
      setPostFotoPreview(null);
      setPostPrecioAntes("");
      setPostPrecioDespues("");
      setPostFechaSorteo("");
      setShowForm(false);
    } catch {
      setPostError("No se pudo publicar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost(postId: string) {
    const token = await getToken();
    await fetch(`${API}/api/comercios/${comercio.slug}/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  return (
    <div className="space-y-4 pb-10">
      <div className={`rounded-2xl border p-4 ${isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}>
        <p className={`text-sm font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Tu comunidad</p>
        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Publica novedades, ofertas y sorteos. Tus suscriptores reciben una notificacion.
        </p>
        <button
          onClick={() => setShowWizard(true)}
          className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm transition-colors"
        >
          <Megaphone className="w-4 h-4" />
          Nueva publicacion
        </button>
      </div>

      {showForm && (
        <div className={`rounded-2xl border p-4 space-y-3 ${isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"}`}>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {([
              { id: "novedad", label: "Novedad" },
              { id: "oferta", label: "Oferta" },
              { id: "sorteo", label: "Sorteo" },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setPostTipo(t.id)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  postTipo === t.id
                    ? "bg-amber-500 text-white"
                    : isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <textarea
            value={postContenido}
            onChange={(e) => setPostContenido(e.target.value)}
            placeholder={
              postTipo === "oferta" ? "Describe la oferta..." :
              postTipo === "sorteo" ? "Describe el sorteo y como participar..." :
              "Contale algo a tu comunidad..."
            }
            rows={4}
            className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-none ${inputCls}`}
          />

          {postTipo === "oferta" && (
            <div className="flex gap-2">
              <input
                type="text"
                value={postPrecioAntes}
                onChange={(e) => setPostPrecioAntes(e.target.value)}
                placeholder="Precio antes"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none flex-1 ${inputCls}`}
              />
              <input
                type="text"
                value={postPrecioDespues}
                onChange={(e) => setPostPrecioDespues(e.target.value)}
                placeholder="Precio oferta"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none flex-1 ${inputCls}`}
              />
            </div>
          )}

          {postTipo === "sorteo" && (
            <input
              type="datetime-local"
              value={postFechaSorteo}
              onChange={(e) => setPostFechaSorteo(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
            />
          )}

          <div>
            {postFotoPreview ? (
              <div className="relative w-full h-40">
                <Image src={postFotoPreview} alt="preview" fill className="object-cover rounded-xl" unoptimized />
                <button
                  onClick={() => { setPostFoto(null); setPostFotoPreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed cursor-pointer text-xs transition-colors ${isDark ? "border-gray-700 text-gray-500 hover:bg-gray-800" : "border-gray-300 text-gray-400 hover:bg-gray-50"}`}>
                <ImageIcon className="w-4 h-4" />
                Agregar foto (opcional)
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPostFoto(file);
                      const reader = new FileReader();
                      reader.onload = (ev) => setPostFotoPreview(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
          </div>

          {postError && <p className="text-xs text-red-500">{postError}</p>}

          <button
            onClick={handlePublicar}
            disabled={!postContenido.trim() || saving}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-bold text-sm transition-colors"
          >
            {saving ? "Publicando..." : "Publicar"}
          </button>
        </div>
      )}

      {loading ? (
        <p className={`text-xs text-center py-4 ${isDark ? "text-gray-600" : "text-gray-400"}`}>Cargando...</p>
      ) : posts.length === 0 ? (
        <p className={`text-xs text-center py-8 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
          No hay publicaciones aun. Crea la primera!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <div key={post.id} className="relative">
              <ComercioPostCard post={post} variant="feed" isDark={isDark} />
              <button
                onClick={() => handleDeletePost(post.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center text-white"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showWizard && (
        <NuevoPostWizard
          comercio={{ id: comercio.id, nombre: comercio.nombre, slug: comercio.slug }}
          getToken={getToken}
          onComplete={(post) => {
            setPosts((prev) => [post as ComercioPost, ...prev]);
            setShowWizard(false);
          }}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}
