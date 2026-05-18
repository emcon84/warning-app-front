"use client";

const HABILIDADES_SUGERIDAS = [
  "Administración", "Atención al cliente", "Caja y cobranzas", "Cocina",
  "Contabilidad", "Diseño gráfico", "Electricidad", "Enfermería",
  "Gastronomía", "Informática", "Limpieza", "Logística", "Mantenimiento",
  "Marketing", "Mecánica", "Panadería", "Plomería", "Recepción", "Seguridad", "Ventas",
];

const MODALIDADES = ["Presencial", "A domicilio", "Part-time", "Full-time", "Por horas", "Temporal"];

interface Props {
  habilidades: string[];
  habilidadInput: string;
  horario: string;
  salario: string;
  modalidad: string;
  error: string | null;
  inputCls: string;
  chipBase: string;
  chipSel: string;
  textSec: string;
  onHabilidadInputChange: (v: string) => void;
  onHabilidadKeyDown: (e: React.KeyboardEvent) => void;
  onAddHabilidad: (h: string) => void;
  onRemoveHabilidad: (h: string) => void;
  onHorario: (v: string) => void;
  onSalario: (v: string) => void;
  onModalidad: (v: string) => void;
}

export default function StepDetalles({
  habilidades, habilidadInput, horario, salario, modalidad, error,
  inputCls, chipBase, chipSel, textSec,
  onHabilidadInputChange, onHabilidadKeyDown, onAddHabilidad, onRemoveHabilidad,
  onHorario, onSalario, onModalidad,
}: Props) {
  const INPUT_CLS = `w-full px-4 py-3.5 rounded-2xl ${inputCls} text-base focus:outline-none transition-colors`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={`text-xs mb-1.5 block ${textSec}`}>Habilidades buscadas</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={habilidadInput}
            onChange={(e) => onHabilidadInputChange(e.target.value)}
            onKeyDown={onHabilidadKeyDown}
            placeholder="Escribí una y Enter"
            className={`flex-1 px-4 py-3 rounded-2xl border ${inputCls} text-sm focus:outline-none transition-colors`}
          />
          <button
            onClick={() => { onAddHabilidad(habilidadInput); onHabilidadInputChange(""); }}
            className={`px-4 py-3 rounded-2xl border ${chipBase} text-sm transition-colors`}
          >
            +
          </button>
        </div>

        {habilidades.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {habilidades.map((h) => (
              <span key={h} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm ${chipSel}`}>
                {h}
                <button onClick={() => onRemoveHabilidad(h)} className="hover:opacity-70">✕</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {HABILIDADES_SUGERIDAS.filter((h) => !habilidades.includes(h)).slice(0, 10).map((h) => (
            <button
              key={h}
              onClick={() => onAddHabilidad(h)}
              className={`px-3 py-1.5 rounded-full text-xs border ${chipBase} transition-colors`}
            >
              + {h}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={`text-xs mb-1.5 block ${textSec}`}>Horario (opcional)</label>
        <input
          type="text"
          value={horario}
          onChange={(e) => onHorario(e.target.value)}
          placeholder="Ej: Lunes a viernes 9 a 18hs"
          maxLength={150}
          className={INPUT_CLS}
        />
      </div>

      <div>
        <label className={`text-xs mb-1.5 block ${textSec}`}>Remuneración (opcional)</label>
        <input
          type="text"
          value={salario}
          onChange={(e) => onSalario(e.target.value)}
          placeholder="Ej: A convenir, $500.000, Sueldo en blanco..."
          maxLength={80}
          className={INPUT_CLS}
        />
      </div>

      <div>
        <label className={`text-xs mb-1.5 block ${textSec}`}>Modalidad (opcional)</label>
        <div className="flex flex-wrap gap-2">
          {MODALIDADES.map((m) => (
            <button
              key={m}
              onClick={() => onModalidad(modalidad === m ? "" : m)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${modalidad === m ? chipSel : chipBase}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-2xl bg-red-900/30 border border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
