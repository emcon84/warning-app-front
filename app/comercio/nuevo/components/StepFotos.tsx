"use client";

import Image from "next/image";
import { Camera, X } from "lucide-react";

interface Props {
  mainPreview: string | null;
  galleryPreviews: string[];
  galleryCount: number;
  onMainPhotoClick: () => void;
  onMainPhotoClear: () => void;
  onGalleryClick: () => void;
  onRemoveGallery: (idx: number) => void;
  mainPhotoRef: React.RefObject<HTMLInputElement | null>;
  galleryRef: React.RefObject<HTMLInputElement | null>;
  onMainPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGalleryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  isDark: boolean;
  textSec: string;
  textMut: string;
  textPri: string;
  border: string;
}

export function StepFotos({
  mainPreview, galleryPreviews, galleryCount,
  onMainPhotoClick, onMainPhotoClear, onGalleryClick, onRemoveGallery,
  mainPhotoRef, galleryRef, onMainPhotoChange, onGalleryChange,
  error, isDark, textSec, textMut, textPri, border,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Foto principal */}
      <div>
        <label className={`text-xs mb-3 block ${textSec}`}>Logo o foto principal</label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMainPhotoClick}
            className={`w-24 h-24 rounded-full border-2 border-dashed ${
              isDark
                ? "border-gray-700 hover:border-gray-500 bg-gray-900"
                : "border-gray-300 hover:border-gray-400 bg-gray-100"
            } flex items-center justify-center overflow-hidden transition-colors relative`}
          >
            {mainPreview ? (
              <Image src={mainPreview} alt="Preview" fill className="object-cover" unoptimized />
            ) : (
              <Camera className={`w-8 h-8 ${textMut}`} />
            )}
          </button>
          <div>
            <p className={`text-sm font-medium ${textPri}`}>
              {mainPreview ? "Foto seleccionada" : "Sin foto aún"}
            </p>
            <p className={`text-xs mt-1 ${textMut}`}>Circular, recomendado 400x400px</p>
            {mainPreview && (
              <button
                type="button"
                onClick={onMainPhotoClear}
                className="text-xs mt-1 text-red-400 hover:text-red-300"
              >
                Quitar foto
              </button>
            )}
          </div>
        </div>
        <input
          ref={mainPhotoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onMainPhotoChange}
        />
      </div>

      {/* Galería */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={`text-xs ${textSec}`}>
            Galería <span className={textMut}>({galleryCount}/6)</span>
          </label>
          {galleryCount < 6 && (
            <button
              type="button"
              onClick={onGalleryClick}
              className={`text-xs px-3 py-1.5 rounded-xl border ${border} ${textSec} hover:border-gray-600 transition-colors`}
            >
              + Agregar fotos
            </button>
          )}
        </div>

        {galleryCount > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {galleryPreviews.map((src, i) => (
              <div key={i} className="relative aspect-square">
                <div className={`w-full h-full rounded-xl overflow-hidden border relative ${border}`}>
                  <Image src={src} alt={`Foto ${i + 1}`} fill className="object-cover" unoptimized />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveGallery(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {galleryCount === 0 && (
          <button
            type="button"
            onClick={onGalleryClick}
            className={`w-full py-10 rounded-xl border-2 border-dashed ${
              isDark
                ? "border-gray-700 hover:border-gray-500 text-gray-500"
                : "border-gray-300 hover:border-gray-400 text-gray-400"
            } flex flex-col items-center gap-2 transition-colors`}
          >
            <Camera className="w-8 h-8" />
            <span className="text-xs">Agregar fotos del local</span>
          </button>
        )}

        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onGalleryChange}
        />
      </div>

      {error && (
        <p className="text-sm border rounded-2xl px-4 py-3 text-red-400 bg-red-900/20 border-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
