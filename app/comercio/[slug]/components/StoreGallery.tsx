"use client";

import type { ThemeClasses } from "./types";
import { resolvePhotoUrl } from "../../../lib/utils/photo";

interface Props {
  photos: string[];
  theme: ThemeClasses;
  onPhotoClick: (index: number) => void;
}

export function StoreGallery({ photos, theme, onPhotoClick }: Props) {
  const { isDark, textMuted } = theme;

  return (
    <div className="mx-4 mt-4">
      <p className={`text-xs font-semibold uppercase tracking-wider mb-2.5 ${textMuted}`}>
        Fotos del local
      </p>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPhotoClick(i)}
            className={`aspect-square rounded-xl overflow-hidden border focus:outline-none group ${isDark ? "border-gray-800" : "border-gray-200"}`}
          >
            <img
              src={resolvePhotoUrl(url)}
              alt={`Foto ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
