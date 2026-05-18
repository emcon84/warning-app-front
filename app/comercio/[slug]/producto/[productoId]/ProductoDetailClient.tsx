"use client";

import { useState, useEffect } from "react";
import { Comercio, Producto } from "../../../../types";
import Navbar from "../../../../components/Navbar";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Copy, Check, X, Instagram, Download } from "lucide-react";

import { API_URL } from "../../../../lib/api/client";

function photoUrl(url?: string | null) {
  if (!url) return null;
  return url.startsWith("/uploads/") ? `${url}` : url;
}

function trackEvent(slug: string, type: string) {
  fetch(`${API_URL}/api/comercios/${slug}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  }).catch(() => {});
}

interface Props {
  producto: Producto;
  comercio: Comercio;
}

export default function ProductoDetailClient({ producto, comercio }: Props) {
  const { isDark } = useTheme();
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [loadingShare, setLoadingShare] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    trackEvent(comercio.slug, "product_view");
  }, [comercio.slug]);

  const bg      = isDark ? "bg-gray-950" : "bg-gray-50";
  const cardBg  = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textSec = isDark ? "text-gray-400" : "text-gray-600";
  const textMut = isDark ? "text-gray-600" : "text-gray-400";

  const waText = encodeURIComponent(`Hola! Te consulto por: ${producto.nombre}`);
  const waUrl  = `https://wa.me/${comercio.whatsapp}?text=${waText}`;

  const logoSrc = photoUrl(comercio.logo);
  const fotoSrc = photoUrl(producto.foto);

  const productoLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/comercio/${comercio.slug}/producto/${producto.id}`
      : `/comercio/${comercio.slug}/producto/${producto.id}`;

  const shareParams = new URLSearchParams({
    nombre: producto.nombre,
    tipo: producto.tipo ?? "producto",
    ...(producto.precio ? { precio: producto.precio } : {}),
    ...(fotoSrc ? { foto: fotoSrc } : {}),
    comercio: comercio.nombre,
    ...(logoSrc ? { logo: logoSrc } : {}),
  });
  const storyUrl = `/share/producto?${shareParams.toString()}`;

  async function handleCopyLink(setter: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(productoLink);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch {/* silent */}
  }

  async function downloadAndShare() {
    setLoadingShare(true);
    setShareError(false);
    try {
      let blob = cachedBlob;
      if (!blob) {
        const res = await fetch(`${window.location.origin}${storyUrl}`);
        if (!res.ok) throw new Error("error generando imagen");
        blob = await res.blob();
        setCachedBlob(blob);
      }
      const file = new File([blob], "producto-story.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "producto-story.png";
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } catch {
      setShareError(true);
      setTimeout(() => setShareError(false), 3000);
    } finally {
      setLoadingShare(false);
    }
  }

  const tipoBadge = producto.tipo === "servicio"
    ? isDark
      ? "bg-violet-900/40 text-violet-400 border-violet-800"
      : "bg-violet-100 text-violet-700 border-violet-300"
    : isDark
      ? "bg-blue-900/40 text-blue-400 border-blue-800"
      : "bg-blue-100 text-blue-700 border-blue-300";

  return (
    <div className={`min-h-screen ${bg} ${textPri} flex flex-col`}>
      <Navbar sidebarDisabled />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-20 pb-32">

        {/* Back */}
        <button
          onClick={() => router.push(`/comercio/${comercio.slug}`)}
          className={`flex items-center gap-1.5 text-sm mb-6 ${textSec} hover:${textPri} transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          {comercio.nombre}
        </button>

        {/* Layout: 1 col mobile, 2 col desktop */}
        <div className="flex flex-col md:flex-row md:gap-10 md:items-start">

          {/* Columna izquierda — imagen */}
          {fotoSrc && (
            <div className="w-full md:w-[480px] md:flex-shrink-0 mb-5 md:mb-0">
              <div className="w-full aspect-square rounded-2xl overflow-hidden">
                <img src={fotoSrc} alt={producto.nombre} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Columna derecha — info + acciones */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">

            {/* Header comercio */}
            <div className="flex items-center gap-3">
              {logoSrc ? (
                <img src={logoSrc} alt={comercio.nombre} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                  {comercio.nombre[0]}
                </div>
              )}
              <div>
                <p className={`font-semibold text-sm ${textPri}`}>{comercio.nombre}</p>
                <p className={`text-xs ${textMut}`}>{comercio.rubro}</p>
              </div>
            </div>

            {/* Info card */}
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <span className={`text-xs px-2.5 py-1 rounded-full border capitalize mb-3 inline-block font-medium ${tipoBadge}`}>
                {producto.tipo ?? "producto"}
              </span>

              <h1 className={`text-2xl font-bold mb-2 ${textPri}`}>{producto.nombre}</h1>

              {producto.descripcion && (
                <p className={`text-sm leading-relaxed mb-4 ${textSec}`}>{producto.descripcion}</p>
              )}

              {producto.precio && (
                <span className={`text-2xl font-black px-4 py-1.5 rounded-xl border inline-block ${
                  isDark ? "bg-green-400/10 text-green-300 border-green-700" : "bg-green-50 text-green-700 border-green-300"
                }`}>
                  {producto.precio}
                </span>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white"
                style={{ backgroundColor: "#25D366" }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Consultar por WhatsApp
              </a>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border transition-colors ${
                    isDark
                      ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </button>
                <button
                  onClick={() => handleCopyLink(setLinkCopied)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border transition-colors ${
                    isDark
                      ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {linkCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {linkCopied ? "Copiado!" : "Copiar link"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal Share */}
      {showShareModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 1300, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 ${isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Compartir en Instagram</h3>
                <p className={`text-xs mt-0.5 truncate max-w-[220px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>{producto.nombre}</p>
              </div>
              <button onClick={() => setShowShareModal(false)} className={`p-1.5 rounded-full ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={downloadAndShare}
              disabled={loadingShare}
              className={`w-full flex flex-col items-center gap-3 p-5 rounded-xl border transition-colors disabled:opacity-40 ${isDark ? "border-gray-700 hover:border-gray-500 hover:bg-gray-800" : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"}`}
            >
              <div className={`w-10 h-16 rounded-lg border-2 flex items-center justify-center ${isDark ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-gray-100"}`}>
                {loadingShare
                  ? <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
                  : <Instagram className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                }
              </div>
              <span className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {loadingShare ? "Generando..." : shareError ? "Error — intentá de nuevo" : cachedBlob ? "Compartir ✓" : "Generar Story"}
              </span>
              <span className={`text-[10px] ${isDark ? "text-gray-600" : "text-gray-400"}`}>1080 x 1920 · Instagram</span>
            </button>

            <div className={`mt-4 border-t pt-4 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
              <button
                onClick={() => handleCopyLink(setCopied)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${isDark ? "border-gray-700 hover:border-gray-500 hover:bg-gray-800 text-gray-300" : "border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-gray-700"}`}
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Link copiado!" : "Copiar link"}
              </button>
            </div>

            <p className={`text-[10px] text-center mt-3 flex items-center justify-center gap-1 ${isDark ? "text-gray-700" : "text-gray-400"}`}>
              <Download className="w-3 h-3" />
              En desktop descarga la imagen. En mobile abre el selector del sistema.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
