"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { Calendar, MapPin, Ticket, Upload, ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/contexts/ThemeContext";
import { CATEGORIAS_EVENTO } from "@/lib/types/evento";
import { API_URL } from "@/lib/api/client";

export default function NuevoEventoPage() {
  const { isDark } = useTheme();
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  const bannerRef = useRef<HTMLInputElement>(null);
  const logoRef   = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nombre: "", organizador: "", categoria: "Música",
    lugar: "", barrio: "", direccion: "",
    fecha: "", fechaFin: "", precio: "", descripcion: "",
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bg   = isDark ? "bg-gray-950 min-h-screen" : "bg-gray-50 min-h-screen";
  const card = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const inp  = `w-full text-sm px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`;
  const lab  = `text-xs font-semibold mb-1 block ${isDark ? "text-gray-400" : "text-gray-500"}`;

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));
  }

  function handleImg(file: File | null, setFile: (f: File | null) => void, setPreview: (u: string | null) => void) {
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSignedIn) { setError("Tenés que iniciar sesión"); return; }
    if (!form.nombre || !form.lugar || !form.fecha || !form.organizador) {
      setError("Completá nombre, organizador, lugar y fecha"); return;
    }
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (bannerFile) fd.append("banner", bannerFile);
      if (logoFile)   fd.append("logo",   logoFile);

      const res = await fetch(`${API_URL}/api/eventos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token ?? ""}` },
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al crear el evento");
      }
      const data = await res.json();
      router.push(`/evento/${data.slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={bg}>
      <Navbar />
      <div className="max-w-xl mx-auto px-4 pt-20 pb-10">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => router.back()} className={`p-2 rounded-xl ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>Publicar evento</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Banner */}
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            <div
              className={`relative h-44 cursor-pointer flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
              onClick={() => bannerRef.current?.click()}
            >
              {bannerPreview ? (
                <Image src={bannerPreview} alt="banner" fill className="object-cover" />
              ) : (
                <div className="text-center">
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                  <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Subir banner del evento</p>
                  <p className={`text-xs ${isDark ? "text-gray-600" : "text-gray-300"}`}>Recomendado: 1200x600px</p>
                </div>
              )}
            </div>
            <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => handleImg(e.target.files?.[0] ?? null, setBannerFile, setBannerPreview)} />
          </div>

          {/* Datos principales */}
          <div className={`rounded-2xl border p-4 space-y-3 ${card}`}>
            <div>
              <label className={lab}>Nombre del evento *</label>
              <input className={inp} placeholder="Ej: Festival de Jazz de Reconquista" value={form.nombre} onChange={set("nombre")} maxLength={150} />
            </div>
            <div>
              <label className={lab}>Organizador *</label>
              <input className={inp} placeholder="Nombre del organizador o banda" value={form.organizador} onChange={set("organizador")} maxLength={100} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lab}>Categoría *</label>
                <select className={inp} value={form.categoria} onChange={set("categoria")}>
                  {CATEGORIAS_EVENTO.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={lab}>Precio</label>
                <input className={inp} placeholder="Gratis / $1500" value={form.precio} onChange={set("precio")} maxLength={80} />
              </div>
            </div>
          </div>

          {/* Fecha y lugar */}
          <div className={`rounded-2xl border p-4 space-y-3 ${card}`}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lab}><Calendar className="inline w-3 h-3 mr-1" />Inicio *</label>
                <input type="datetime-local" className={inp} value={form.fecha} onChange={set("fecha")} />
              </div>
              <div>
                <label className={lab}>Fin (opcional)</label>
                <input type="datetime-local" className={inp} value={form.fechaFin} onChange={set("fechaFin")} />
              </div>
            </div>
            <div>
              <label className={lab}><MapPin className="inline w-3 h-3 mr-1" />Lugar *</label>
              <input className={inp} placeholder="Nombre del lugar" value={form.lugar} onChange={set("lugar")} maxLength={150} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lab}>Barrio</label>
                <input className={inp} placeholder="Centro, Norte..." value={form.barrio} onChange={set("barrio")} maxLength={100} />
              </div>
              <div>
                <label className={lab}>Dirección</label>
                <input className={inp} placeholder="Calle y número" value={form.direccion} onChange={set("direccion")} maxLength={200} />
              </div>
            </div>
          </div>

          {/* Descripción y logo */}
          <div className={`rounded-2xl border p-4 space-y-3 ${card}`}>
            <div>
              <label className={lab}>Descripción</label>
              <textarea className={`${inp} resize-none`} rows={4} placeholder="Contá de qué se trata el evento..." value={form.descripcion} onChange={set("descripcion")} maxLength={1000} />
            </div>
            <div>
              <label className={lab}>Logo del organizador (opcional)</label>
              <div className="flex items-center gap-3">
                {logoPreview && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={logoPreview} alt="logo" width={48} height={48} className="object-cover w-full h-full" />
                  </div>
                )}
                <button type="button" onClick={() => logoRef.current?.click()} className={`text-xs px-3 py-2 rounded-xl border transition-colors ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  <Upload className="inline w-3 h-3 mr-1" />Subir logo
                </button>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => handleImg(e.target.files?.[0] ?? null, setLogoFile, setLogoPreview)} />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 px-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Publicando...</> : "Publicar evento"}
          </button>
        </form>
      </div>
    </div>
  );
}
