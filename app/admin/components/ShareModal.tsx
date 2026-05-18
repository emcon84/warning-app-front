"use client";

import { useState } from "react";
import { Instagram, X, Download, Copy, Check } from "lucide-react";
import type { ShareTarget, ShareFormat } from "../types";

async function downloadAndShare(imageUrl: string, filename: string) {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: blob.type || "image/png" });

  if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file] });
    return;
  }

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

interface Props {
  target: ShareTarget;
  onClose: () => void;
}

export function ShareModal({ target, onClose }: Props) {
  const [loading, setLoading] = useState<ShareFormat | null>(null);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(target.profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  }

  async function handle(format: ShareFormat) {
    setLoading(format);
    const url = `${target.shareUrl}&format=${format}`;
    const filename = `${target.type}-${format}.png`;
    try {
      await downloadAndShare(url, filename);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 1300, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Compartir en Instagram</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">{target.label}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-600 mb-5">Elegí el formato para generar la imagen:</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handle("story")}
            disabled={!!loading}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            <div className="w-10 h-16 rounded-lg border-2 border-gray-600 bg-gray-800 flex items-center justify-center">
              {loading === "story" ? (
                <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
              ) : (
                <Instagram className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className="text-xs font-semibold text-gray-300">Story</span>
            <span className="text-[10px] text-gray-600">1080 x 1920</span>
          </button>

          <button
            onClick={() => handle("feed")}
            disabled={!!loading}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            <div className="w-14 h-14 rounded-lg border-2 border-gray-600 bg-gray-800 flex items-center justify-center">
              {loading === "feed" ? (
                <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
              ) : (
                <Instagram className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className="text-xs font-semibold text-gray-300">Feed</span>
            <span className="text-[10px] text-gray-600">1080 x 1080</span>
          </button>
        </div>

        <div className="mt-4 border-t border-gray-800 pt-4">
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-colors text-sm font-semibold text-gray-300"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "¡Link copiado!" : "Copiar link del perfil"}
          </button>
        </div>

        <p className="text-[10px] text-gray-700 text-center mt-3 flex items-center justify-center gap-1">
          <Download className="w-3 h-3" />
          En desktop descarga la imagen. En mobile abre el selector del sistema.
        </p>
      </div>
    </div>
  );
}
