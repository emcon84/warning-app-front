"use client";

import Link from "next/link";
import Image from "next/image";
import type { Comercio } from "../../types";
import { resolvePhotoUrl } from "../../lib/utils/photo";

interface Props {
  comercio: Comercio;
  dark: boolean;
}

export function StoreResultCard({ comercio, dark }: Props) {
  const foto = comercio.logo || comercio.foto;
  return (
    <Link href={`/comercio/${comercio.slug}`}>
      <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${dark ? "bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"}`}>
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow">
          {foto ? (
            <Image
              src={resolvePhotoUrl(foto)}
              alt={comercio.nombre}
              className="w-full h-full object-cover"
              width={64}
              height={64}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-amber-700 to-amber-900 text-2xl font-bold text-white">
              {comercio.nombre[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
              {comercio.nombre}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${dark ? "bg-amber-900/40 text-amber-400 border-amber-800" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
              Comercio
            </span>
          </div>
          <p className={`text-sm mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {comercio.rubro}
          </p>
          <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>
            {comercio.barrio}
          </p>
        </div>
        <svg className={`w-5 h-5 shrink-0 ${dark ? "text-gray-600" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
