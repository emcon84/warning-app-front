"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Instagram, Link } from "lucide-react";
import { API_URL } from "../../../lib/api/client";

interface Props {
  createdProduct: { id: string; nombre: string; precio?: string | null; foto?: string | null } | null;
  comercio: { nombre: string; slug: string };
  tipo: string;
  logoUrl: string | null;
  downloading: boolean;
  linkCopied: boolean;
  onDownloadShare: () => void;
  onCopyLink: () => void;
}

export default function Step3Listo({
  createdProduct, comercio, tipo, logoUrl,
  downloading, linkCopied,
  onDownloadShare, onCopyLink,
}: Props) {
  const fotoRaw = createdProduct?.foto ?? "";
  const foto = fotoRaw ? (fotoRaw.startsWith("http") ? fotoRaw : `${API_URL}${fotoRaw}`) : "";
  const logo = logoUrl ?? "";

  const params = new URLSearchParams({
    nombre: createdProduct?.nombre ?? "",
    tipo,
    comercio: comercio.nombre,
    ...(createdProduct?.precio ? { precio: createdProduct.precio } : {}),
    ...(foto ? { foto } : {}),
    ...(logo ? { logo } : {}),
  });

  return (
    <div className="p-5 space-y-6 pb-8">
      <div className="flex flex-col items-center gap-3 pt-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center"
        >
          <Check className="w-8 h-8 text-white" strokeWidth={3} />
        </motion.div>
        <div className="text-center">
          <p className="text-xl font-black text-gray-900 dark:text-white">Producto publicado</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ya aparece en tu catalogo</p>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800" />

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Compartilo en Instagram</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Genera tu story con un tap y compartilo</p>

        <div className="flex justify-center">
          <div
            className="relative rounded-2xl overflow-hidden shadow-lg"
            style={{ width: 150, aspectRatio: "9/16" }}
          >
            <Image
              src={`/share/producto?${params}`}
              alt="preview story"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        <button
          onClick={onDownloadShare}
          disabled={downloading}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Instagram className="w-4 h-4" />
          {downloading ? "Descargando..." : "Descargar para Instagram"}
        </button>

        <button
          onClick={onCopyLink}
          className="w-full py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Link className="w-4 h-4" />
          {linkCopied ? "Link copiado" : "Copiar link del producto"}
        </button>
      </div>
    </div>
  );
}
