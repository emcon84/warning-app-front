"use client";

import { useState, useEffect } from "react";
import { Download, QrCode } from "lucide-react";
import type { Comercio } from "../../types";

const SITE = "https://reportesreconquista.com";

interface Props {
  comercio: Pick<Comercio, "nombre" | "slug" | "rubro" | "barrio">;
  isDark: boolean;
  cardBg: string;
  textPri: string;
  textSec: string;
  textMuted: string;
}

export default function KitDigitalizacion({ comercio, isDark, cardBg, textPri, textSec, textMuted }: Props) {
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const profileUrl = `${SITE}/comercio/${comercio.slug}`;

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then((mod) => {
      const QRCode = (mod as any).default ?? mod;
      QRCode.toDataURL(profileUrl, { width: 300, margin: 1 }).then((url: string) => {
        if (!cancelled) setQrPreview(url);
      });
    });
    return () => { cancelled = true; };
  }, [profileUrl]);

  async function handleDownload() {
    setGenerating(true);
    try {
      const [{ jsPDF }, qrMod] = await Promise.all([
        import("jspdf"),
        import("qrcode"),
      ]);
      const QRCode = (qrMod as any).default ?? qrMod;

      const [logoPng, qrPng] = await Promise.all([
        svgToPng("/icon.svg", 180),
        QRCode.toDataURL(profileUrl, {
          width: 600,
          margin: 1,
          color: { dark: "#111827", light: "#ffffff" },
        }),
      ]);

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
      const W = 148;

      // Header azul
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, W, 58, "F");

      // Logo
      doc.addImage(logoPng, "PNG", (W - 22) / 2, 8, 22, 22);

      // Nombre de la app
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Reportes Reconquista", W / 2, 38, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(191, 219, 254);
      doc.text("Directorio de Comercios Locales", W / 2, 46, { align: "center" });

      // Nombre del comercio
      doc.setTextColor(17, 24, 39);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      const nombreLines = doc.splitTextToSize(comercio.nombre, W - 20) as string[];
      doc.text(nombreLines, W / 2, 72, { align: "center" });

      const afterNombre = 72 + (nombreLines.length - 1) * 7;

      // Rubro y barrio
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`${comercio.rubro} · ${comercio.barrio}`, W / 2, afterNombre + 9, { align: "center" });

      // CTA
      const ctaY = afterNombre + 21;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(37, 99, 235);
      doc.text("Escaneá para ver nuestros precios", W / 2, ctaY, { align: "center" });
      doc.text("y catálogo actualizado", W / 2, ctaY + 6, { align: "center" });

      // QR
      const qrSize = 82;
      const qrY = ctaY + 13;
      doc.addImage(qrPng, "PNG", (W - qrSize) / 2, qrY, qrSize, qrSize);

      // Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.text("reportesreconquista.com", W / 2, 204, { align: "center" });

      doc.save(`kit-vidriera-${comercio.slug}.pdf`);
    } catch (e) {
      console.error("Error generando kit:", e);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Explicación */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className={`font-bold text-sm ${textPri}`}>Kit para tu Vidriera</p>
            <p className={`text-xs mt-1 leading-relaxed ${textSec}`}>
              Imprimí este cartel y pegalo en tu local para que tus clientes accedan a tu catálogo digital escaneando el QR.
            </p>
          </div>
        </div>
      </div>

      {/* Preview del flyer */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        <div className={`px-4 py-3 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
          <p className={`text-xs font-semibold ${textSec}`}>Vista previa del cartel</p>
        </div>
        <div className="p-5 flex justify-center">
          <div
            className="w-52 rounded-xl overflow-hidden shadow-lg border border-gray-200"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            <div className="bg-blue-600 px-4 py-5 text-center">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icon.svg" alt="Logo" className="w-full h-full" />
              </div>
              <p className="text-white font-bold text-xs">Reportes Reconquista</p>
              <p className="text-blue-200" style={{ fontSize: "9px", marginTop: 2 }}>
                Directorio de Comercios Locales
              </p>
            </div>

            <div className="bg-white px-3 py-4 text-center">
              <p className="font-black text-gray-900 text-sm leading-tight">{comercio.nombre}</p>
              <p className="text-gray-500 mt-1" style={{ fontSize: "9px" }}>
                {comercio.rubro} · {comercio.barrio}
              </p>
              <p className="text-blue-600 font-bold mt-3 leading-snug" style={{ fontSize: "9px" }}>
                Escaneá para ver nuestros<br />precios y catálogo actualizado
              </p>
              <div className="mt-3 flex justify-center">
                {qrPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrPreview} alt="QR Code" className="w-24 h-24" />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded animate-pulse" />
                )}
              </div>
              <p className="text-gray-300 mt-2" style={{ fontSize: "8px" }}>
                reportesreconquista.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* URL del perfil */}
      <div className={`rounded-2xl border p-4 ${cardBg}`}>
        <p className={`text-xs mb-1.5 ${textSec}`}>URL de tu perfil</p>
        <p className={`text-xs font-mono break-all ${textPri}`}>{profileUrl}</p>
      </div>

      {/* Botón de descarga */}
      <button
        onClick={handleDownload}
        disabled={generating || !qrPreview}
        className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors disabled:opacity-40"
      >
        {generating ? (
          "Generando PDF..."
        ) : (
          <>
            <Download className="w-4 h-4" />
            Descargar Kit para mi Vidriera
          </>
        )}
      </button>

      <p className={`text-xs text-center ${textMuted}`}>PDF formato A5, listo para imprimir</p>
    </div>
  );
}

async function svgToPng(svgUrl: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = svgUrl;
  });
}
