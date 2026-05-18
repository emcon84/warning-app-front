"use client";

import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { resolvePhotoUrl } from "../../../lib/utils/photo";

interface Props {
  photos: string[];
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function StoreLightbox({ photos, index, onClose, onPrev, onNext }: Props) {
  if (index === null) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/20"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>

      {photos.length > 1 && (
        <button
          className="absolute left-3 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/20"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      <div className="relative max-w-[85vw] max-h-[85vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
        <Image
          src={resolvePhotoUrl(photos[index])}
          alt="Foto del comercio"
          fill
          className="object-contain rounded-xl"
        />
      </div>

      {photos.length > 1 && (
        <button
          className="absolute right-3 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/20"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {photos.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <span className="text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
            {index + 1} / {photos.length}
          </span>
        </div>
      )}
    </div>
  );
}
