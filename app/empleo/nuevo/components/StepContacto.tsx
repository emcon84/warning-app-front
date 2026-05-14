"use client";

const BARRIOS = [
  "Centro", "Barrio Norte", "Barrio Sur", "Barrio Oeste", "Villa del Parque",
  "Las Lomas", "Parque Industrial", "Barrio Newbery", "Los Lapachos", "San Cayetano", "Otro",
];

interface Props {
  barrio: string;
  whatsapp: string;
  disponible: boolean;
  error: string | null;
  loading: boolean;
  isDark: boolean;
  inputClass: string;
  labelClass: string;
  textSec: string;
  onBarrio: (v: string) => void;
  onWhatsapp: (v: string) => void;
  onToggleDisponible: () => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function StepContacto({
  barrio, whatsapp, disponible, error, loading, isDark,
  inputClass, labelClass, textSec,
  onBarrio, onWhatsapp, onToggleDisponible, onBack, onSubmit,
}: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
          Contacto y disponibilidad
        </h2>
        <p className={`text-sm ${textSec}`}>Como te van a contactar los interesados.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={`text-sm font-medium ${labelClass}`}>Barrio (opcional)</label>
        <select
          value={barrio}
          onChange={(e) => onBarrio(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
        >
          <option value="">Sin especificar</option>
          {BARRIOS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={`text-sm font-medium ${labelClass}`}>WhatsApp (opcional)</label>
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => onWhatsapp(e.target.value)}
          placeholder="Ej: 3482123456"
          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
        />
        <p className={`text-xs ${textSec}`}>Solo se muestra si el interesado no recibe respuesta por chat.</p>
      </div>

      <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
        <div>
          <p className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Disponible para trabajar</p>
          <p className={`text-xs ${textSec}`}>Los empleadores ven tu estado en el buscador.</p>
        </div>
        <button
          onClick={onToggleDisponible}
          className={`relative w-12 h-6 rounded-full transition-colors ${disponible ? "bg-blue-600" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${disponible ? "translate-x-6" : "translate-x-0"}`} />
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-700 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Atras
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
        >
          {loading ? "Publicando..." : "Publicar perfil"}
        </button>
      </div>
    </div>
  );
}
