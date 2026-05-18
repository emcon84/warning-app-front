"use client";

import Image from "next/image";
import { resolvePhotoUrl } from "../../../../lib/utils/photo";

interface Props {
  fotos: string[];
  isDark: boolean;
  textSec: string;
}

export function ProfilePhotos({ fotos, isDark, textSec }: Props) {
  if (!fotos || fotos.length === 0) return null;
  return (
    <div className="mb-4">
      <p className={`text-sm font-medium mb-2 ${textSec}`}>Trabajos realizados</p>
      <div className="grid grid-cols-3 gap-2">
        {fotos.map((url, i) => (
          <div key={i} className={`aspect-square rounded-xl overflow-hidden border relative ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <Image
              src={resolvePhotoUrl(url)}
              alt={`Trabajo ${i + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}
