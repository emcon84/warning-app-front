"use client";

import { useState } from "react";
import { Comercio, Producto } from "../../../../types";
import Navbar from "../../../../components/Navbar";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Copy, Check, X } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function photoUrl(url?: string | null) {
  if (!url) return null;
  return url.startsWith("/uploads/") ? `${API}${url}` : url;
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

  async function handleNativeShare() {
    try {
      await navigator.share({ title: producto.nombre, url: productoLink });
    } catch {/* silent */}
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

      <div className="flex-1 max-w-xl mx-auto w-full px-4 pt-20 pb-32">

        {/* Back */}
        <button
          onClick={() => router.push(`/comercio/${comercio.slug}`)}
          className={`flex items-center gap-1.5 text-sm mb-5 ${textSec} hover:${textPri} transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          {comercio.nombre}
        </button>

        {/* Header comercio */}
        <div className="flex items-center gap-3 mb-6">
          {logoSrc ? (
            <img src={logoSrc} alt={comercio.nombre} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
              {comercio.nombre[0]}
            </div>
          )}
          <div>
            <p className={`font-semibold text-sm ${textPri}`}>{comercio.nombre}</p>
            <p className={`text-xs ${textMut}`}>{comercio.rubro}</p>
          </div>
        </div>

        {/* Foto producto */}
        {fotoSrc && (
          <div className="w-full aspect-square rounded-2xl overflow-hidden mb-5">
            <img src={fotoSrc} alt={producto.nombre} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Info card */}
        <div className={`rounded-2xl border p-5 ${cardBg} mb-4`}>
          {/* Badge tipo */}
          <span className={`text-xs px-2.5 py-1 rounded-full border capitalize mb-3 inline-block font-medium ${tipoBadge}`}>
            {producto.tipo ?? "producto"}
          </span>

          <h1 className={`text-xl font-bold mb-2 ${textPri}`}>{producto.nombre}</h1>

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
          {/* WhatsApp */}
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
            {/* Compartir Story */}
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

            {/* Copiar link */}
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

      {/* Modal Share Story */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-4 pb-8 sm:p-4">
          <div className={`w-full max-w-sm rounded-3xl ${isDark ? "bg-gray-900" : "bg-white"} shadow-2xl overflow-hidden`}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <p className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Compartir producto</p>
              <button
                onClick={() => setShowShareModal(false)}
                className={`p-1.5 rounded-lg ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview story */}
            <div className="px-5 pb-4">
              <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden bg-gray-950 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={storyUrl}
                  alt="Story preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5 px-5 pb-5">
              {/* Native share (si el browser lo soporta) */}
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full py-3 rounded-2xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir...
                </button>
              )}
              <button
                onClick={() => handleCopyLink(setCopied)}
                className={`w-full py-3 rounded-2xl text-sm font-semibold border transition-colors flex items-center justify-center gap-2 ${
                  isDark
                    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Link copiado!" : "Copiar link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
