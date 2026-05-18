"use client";

import { useState } from "react";
import Image from "next/image";
import { Share2, Copy, Check, Pencil } from "lucide-react";
import type { ComercioOffer } from "../../../types";
import type { ThemeClasses } from "./types";
import { resolvePhotoUrl } from "../../../lib/utils/photo";

interface Props {
  offer: ComercioOffer;
  whatsapp: string;
  theme: ThemeClasses;
  comercioNombre: string;
  comercioLogo?: string;
  comercioSlug: string;
  isOwner?: boolean;
  onEdit?: () => void;
}

export function StoreOfferCard({ offer, whatsapp, theme, comercioNombre, comercioLogo, comercioSlug, isOwner, onEdit }: Props) {
  const { isDark, textPrimary, textSec, textMuted, cardBg } = theme;
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const waText = encodeURIComponent(`Hola! Te consulto por la oferta: ${offer.titulo}`);
  const waUrl  = `https://wa.me/${whatsapp}?text=${waText}`;

  function buildShareParams() {
    const validaHastaStr = offer.validaHasta
      ? new Date(offer.validaHasta).toLocaleDateString("es-AR", { day: "numeric", month: "long" })
      : "";
    const offerPageUrl = `${window.location.origin}/comercio/${comercioSlug}/oferta/${offer.id}`;
    return new URLSearchParams({
      titulo: offer.titulo,
      precio: offer.precio ?? "",
      foto: offer.foto ? resolvePhotoUrl(offer.foto) : "",
      comercio: comercioNombre,
      logo: comercioLogo ? resolvePhotoUrl(comercioLogo) : "",
      validaHasta: validaHastaStr,
      offerUrl: offerPageUrl,
    });
  }

  function openShareModal() {
    setShareBlob(null);
    setShareError(null);
    setShareModalOpen(true);
    const params = buildShareParams();
    fetch(`/share/offer?${params}`)
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.blob(); })
      .then((blob) => setShareBlob(blob))
      .catch(() => setShareError("No se pudo generar la imagen."));
  }

  function doNativeShare() {
    if (!shareBlob) return;
    const file = new File([shareBlob], "oferta.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], title: offer.titulo }).catch((e) => {
        if (e.name !== "AbortError") setShareError("No se pudo compartir.");
      });
    }
  }

  function closeModal() {
    setShareModalOpen(false);
    setShareBlob(null);
    setShareError(null);
    setCopied(false);
  }

  function copyLink() {
    const url = `${window.location.origin}/comercio/${comercioSlug}/oferta/${offer.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const validaHasta = offer.validaHasta
    ? new Date(offer.validaHasta).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const shareParams = shareModalOpen ? buildShareParams() : null;
  const previewSrc  = shareParams ? `/share/offer?${shareParams}` : null;
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.canShare;

  return (
    <>
      {shareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={closeModal}
        >
          <div className="flex flex-col items-center gap-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <p className="text-white text-sm font-semibold text-center">{offer.titulo}</p>
            <div className="relative w-full rounded-2xl overflow-hidden bg-gray-900" style={{ aspectRatio: "9/16" }}>
              {previewSrc && (
                <Image src={previewSrc} alt="Story preview" fill className="object-cover" />
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              {canNativeShare && (
                <button
                  onClick={doNativeShare}
                  disabled={!shareBlob}
                  className="w-full py-3 rounded-2xl text-sm font-semibold text-white bg-blue-600 disabled:opacity-50 disabled:cursor-wait transition-opacity"
                >
                  {shareBlob ? "Compartir historia" : "Preparando imagen..."}
                </button>
              )}
              {!canNativeShare && (
                <p className="text-gray-400 text-xs text-center">Mantené presionada la imagen para guardarla</p>
              )}
              {shareError && <p className="text-red-400 text-xs text-center">{shareError}</p>}
              <button
                onClick={copyLink}
                className="w-full py-3 rounded-2xl text-sm font-semibold border border-gray-600 text-gray-300 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Link copiado!" : "Copiar link de la oferta"}
              </button>
              <button onClick={closeModal} className="text-gray-500 text-xs text-center py-1">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        <a href={`/comercio/${comercioSlug}/oferta/${offer.id}`} className="block">
          {offer.foto && (
            <div className="relative w-full h-44 overflow-hidden">
              <Image
                src={resolvePhotoUrl(offer.foto)}
                alt={offer.titulo}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <p className={`font-bold text-sm leading-snug ${textPrimary}`}>{offer.titulo}</p>
            {offer.descripcion && (
              <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${textSec}`}>{offer.descripcion}</p>
            )}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {offer.precio && (
                <span className={`text-lg font-black px-3 py-1 rounded-xl border ${
                  isDark
                    ? "bg-yellow-400/10 text-yellow-300 border-yellow-700"
                    : "bg-yellow-50 text-yellow-700 border-yellow-300"
                }`}>
                  $ {Number(offer.precio).toLocaleString("es-AR")}
                </span>
              )}
              {validaHasta && (
                <span className={`text-xs ${textMuted}`}>Hasta el {validaHasta}</span>
              )}
            </div>
          </div>
        </a>

        <div className="px-4 pb-4 flex gap-2">
          {isOwner && onEdit && (
            <button
              onClick={onEdit}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 flex-shrink-0 ${
                isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#25D366" }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
          <button
            onClick={openShareModal}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 flex-shrink-0 ${
              isDark
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Story
          </button>
        </div>
      </div>
    </>
  );
}
