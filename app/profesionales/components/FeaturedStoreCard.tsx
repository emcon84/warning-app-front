"use client";

import Link from "next/link";
import type { Comercio } from "../../types";
import { ProfessionalAvatar } from "./ProfessionalAvatar";
import { resolvePhotoUrl } from "../../lib/utils/photo";

interface Props {
  comercio: Comercio;
  dark: boolean;
}

export function FeaturedStoreCard({ comercio, dark }: Props) {
  const foto = comercio.logo || comercio.foto;
  return (
    <Link href={`/comercio/${comercio.slug}`} className="block">
      <div className="flex flex-col items-center gap-2 cursor-pointer group w-full">
        <div className={`w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 transition-all duration-200 ${dark ? "ring-gray-800 group-hover:ring-amber-700" : "ring-gray-200 group-hover:ring-amber-400 shadow-md"}`}>
          <ProfessionalAvatar
            foto={foto ? resolvePhotoUrl(foto) : null}
            nombre={comercio.nombre}
            gradient="from-amber-700 to-amber-900"
          />
        </div>
        <div className="text-center w-full overflow-hidden">
          <p className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>
            {comercio.nombre}
          </p>
          <p className={`text-[11px] truncate mt-0.5 ${dark ? "text-amber-500" : "text-amber-600"}`}>
            {comercio.rubro}
          </p>
        </div>
      </div>
    </Link>
  );
}
