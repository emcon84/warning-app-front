"use client";

import Image from "next/image";
import { User } from "lucide-react";

interface Props {
  nombre: string;
  apellido: string;
  fotoPreview: string | null;
  isDark: boolean;
  inputClass: string;
  labelClass: string;
  textSec: string;
  onNombre: (v: string) => void;
  onApellido: (v: string) => void;
  onFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
}

export default function StepPersonal({
  nombre, apellido, fotoPreview, isDark,
  inputClass, labelClass, textSec,
  onNombre, onApellido, onFotoChange, onNext,
}: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
          Datos personales
        </h2>
        <p className={`text-sm ${textSec}`}>Como te conoceran los empleadores.</p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <label className="cursor-pointer group">
          <div className={`w-24 h-24 rounded-full overflow-hidden border-2 transition-all ${isDark ? "border-gray-700 group-hover:border-blue-500" : "border-gray-200 group-hover:border-blue-400"}`}>
            {fotoPreview ? (
              <div className="relative w-full h-full">
                <Image src={fotoPreview} alt="preview" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                <User className={`w-10 h-10 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
              </div>
            )}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={onFotoChange} />
        </label>
        <p className={`text-xs ${textSec}`}>Toca para agregar foto (opcional)</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={`text-sm font-medium ${labelClass}`}>Nombre *</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => onNombre(e.target.value)}
          placeholder="Tu nombre"
          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={`text-sm font-medium ${labelClass}`}>Apellido *</label>
        <input
          type="text"
          value={apellido}
          onChange={(e) => onApellido(e.target.value)}
          placeholder="Tu apellido"
          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
        />
      </div>

      <button
        onClick={onNext}
        disabled={!nombre.trim() || !apellido.trim()}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
      >
        Siguiente
      </button>
    </div>
  );
}
