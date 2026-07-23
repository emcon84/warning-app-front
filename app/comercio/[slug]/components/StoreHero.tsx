"use client";

import Image from "next/image";
import { resolvePhotoUrl } from "@/lib/utils/photo";

interface Props {
  comercio: { nombre: string; rubro: string; foto?: string | null };
  heroGradient: string;
}

export function StoreHero({ comercio, heroGradient }: Props) {
  return (
    <div className="relative h-56 w-full overflow-hidden">
      {comercio.foto ? (
        <Image
          src={resolvePhotoUrl(comercio.foto)}
          alt={comercio.nombre}
          fill
          className="object-cover"
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${heroGradient} flex items-center justify-center`}>
          <span className="text-8xl font-black text-white/15 select-none">
            {comercio.rubro.split("/")[0].slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
    </div>
  );
}
