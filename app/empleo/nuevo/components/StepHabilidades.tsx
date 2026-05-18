"use client";

const HABILIDADES_SUGERIDAS = [
  "Administración", "Atención al cliente", "Caja y cobranzas", "Cocina",
  "Contabilidad", "Diseño gráfico", "Electricidad", "Enfermería",
  "Gastronomía", "Informática", "Limpieza", "Logística", "Mantenimiento",
  "Marketing", "Mecánica", "Panadería", "Plomería", "Recepción", "Seguridad", "Ventas",
];

interface Props {
  habilidades: string[];
  habilidadInput: string;
  descripcion: string;
  isDark: boolean;
  inputClass: string;
  labelClass: string;
  textSec: string;
  onHabilidadInputChange: (v: string) => void;
  onHabilidadKeyDown: (e: React.KeyboardEvent) => void;
  onAddHabilidad: (h: string) => void;
  onRemoveHabilidad: (h: string) => void;
  onDescripcion: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function StepHabilidades({
  habilidades, habilidadInput, descripcion, isDark,
  inputClass, labelClass, textSec,
  onHabilidadInputChange, onHabilidadKeyDown, onAddHabilidad, onRemoveHabilidad,
  onDescripcion, onBack, onNext,
}: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
          Tus habilidades
        </h2>
        <p className={`text-sm ${textSec}`}>Agrega los rubros en los que tenes experiencia.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={`text-sm font-medium ${labelClass}`}>Habilidades / rubros *</label>
        <div className={`flex flex-wrap gap-2 p-3 rounded-xl border min-h-[48px] ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
          {habilidades.map((h) => (
            <span key={h} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? "bg-blue-900/50 text-blue-300 border border-blue-700" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
              {h}
              <button onClick={() => onRemoveHabilidad(h)} className="ml-0.5 opacity-60 hover:opacity-100">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <input
            type="text"
            value={habilidadInput}
            onChange={(e) => onHabilidadInputChange(e.target.value)}
            onKeyDown={onHabilidadKeyDown}
            placeholder={habilidades.length === 0 ? "Escribi una habilidad y Enter" : "Agregar mas..."}
            className={`flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none ${isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
          />
        </div>
      </div>

      <div>
        <p className={`text-xs mb-2 ${textSec}`}>Sugerencias:</p>
        <div className="flex flex-wrap gap-2">
          {HABILIDADES_SUGERIDAS.filter((h) => !habilidades.includes(h)).map((h) => (
            <button
              key={h}
              onClick={() => onAddHabilidad(h)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${isDark ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"}`}
            >
              + {h}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={`text-sm font-medium ${labelClass}`}>Descripcion breve (opcional)</label>
        <textarea
          value={descripcion}
          onChange={(e) => onDescripcion(e.target.value)}
          placeholder="Contale a los empleadores un poco sobre vos, tu experiencia, que buscas..."
          rows={4}
          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors resize-none ${inputClass}`}
        />
        <p className={`text-xs text-right ${textSec}`}>{descripcion.length}/500</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Atras
        </button>
        <button
          onClick={onNext}
          disabled={habilidades.length === 0}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
