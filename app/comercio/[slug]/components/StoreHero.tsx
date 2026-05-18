"use client";

import Image from "next/image";
import { resolvePhotoUrl } from "../../../lib/utils/photo";

interface Props {
  comercio: { nombre: string; rubro: string; foto?: string | null };
  onBack: () => void;
  heroGradient: string;
}

export function StoreHero({ comercio, onBack, heroGradient }: Props) {
  return (
    <div className="relative h-48 sm:h-56 w-full overflow-hidden">
      {comercio.foto ? (
        <Image
          src={resolvePhotoUrl(comercio.foto)}
          alt={comercio.nombre}
          fill
          className="object-cover"
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${heroGradient} flex items-center justify-center`}>
          <span className="text-7xl font-black text-white/20 select-none">
            {comercio.rubro.split("/")[0].slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <button
        onClick={onBack}
        className="absolute top-14 left-4 flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>
    </div>
  );
}
