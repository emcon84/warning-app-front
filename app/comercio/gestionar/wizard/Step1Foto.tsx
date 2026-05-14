"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, X } from "lucide-react";

interface Props {
  photoPreview: string | null;
  aiGenUrl: string | null;
  generatingImg: boolean;
  imgGenError: string | null;
  aiGenNombre: string;
  hasPhoto: boolean;
  onFileSelected: (f: File) => void;
  onClearPhoto: () => void;
  onGenerateAI: () => void;
  onAiGenNombreChange: (v: string) => void;
}

export default function Step1Foto({
  photoPreview,
  aiGenUrl,
  generatingImg,
  imgGenError,
  aiGenNombre,
  hasPhoto,
  onFileSelected,
  onClearPhoto,
  onGenerateAI,
  onAiGenNombreChange,
}: Props) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = "";
  }

  return (
    <div className="p-5 space-y-4 pb-8">
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">La foto del producto</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Opcional — podés agregarla despues</p>
      </div>

      {!photoPreview ? (
        <button
          onClick={() => galleryRef.current?.click()}
          className="w-full aspect-square max-h-72 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Camera className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          <span className="text-sm text-gray-400 dark:text-gray-500">Subí la foto del producto</span>
        </button>
      ) : (
        <div className="relative w-full aspect-square max-h-72">
          <Image
            src={photoPreview}
            alt="preview"
            fill
            className="rounded-3xl object-cover"
            unoptimized
          />
          {aiGenUrl && (
            <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              IA
            </div>
          )}
          <button
            onClick={onClearPhoto}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => cameraRef.current?.click()}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Camara
        </button>
        <button
          onClick={() => galleryRef.current?.click()}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Galeria
        </button>
      </div>

      {hasPhoto && (
        <div className="space-y-2">
          <input
            type="text"
            value={aiGenNombre}
            onChange={e => onAiGenNombreChange(e.target.value)}
            placeholder="Nombre del producto (para la IA)"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={onGenerateAI}
            disabled={generatingImg}
            className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {generatingImg ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
                Generando...
              </>
            ) : (
              "Generar imagen con IA"
            )}
          </button>
          {imgGenError && <p className="text-xs text-red-500">{imgGenError}</p>}
        </div>
      )}

      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleInputChange} />
    </div>
  );
}
