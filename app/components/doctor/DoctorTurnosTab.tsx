import { Plus, Clock } from "lucide-react";
import type { TurnoDisponibilidad } from "@/types";
import { OBRAS_SOCIALES } from "@/utils/doctorHelpers";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const HORARIOS = ["Mañana", "Tarde", "Todo el día"];
const TIPOS_TURNO = ["Con turno previo", "Sin turno", "Por orden de llegada"];

function formatFecha(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 60) return `hace ${diff}m`;
  if (diff < 1440) return `hace ${Math.floor(diff / 60)}h`;
  return `hace ${Math.floor(diff / 1440)}d`;
}

interface FormDisp {
  dias: string[];
  horario: string;
  tipoTurno: string;
  obraSocial: string;
  nota: string;
}

interface Props {
  disponibilidades: TurnoDisponibilidad[];
  showFormDisp: boolean;
  savingDisp: boolean;
  formDisp: FormDisp;
  onShowForm: () => void;
  onHideForm: () => void;
  onToggleDia: (dia: string) => void;
  onFormDispChange: (key: string, value: string) => void;
  onSubmitDisp: () => void;
}

export function DoctorTurnosTab({
  disponibilidades, showFormDisp, savingDisp, formDisp,
  onShowForm, onHideForm, onToggleDia, onFormDispChange, onSubmitDisp,
}: Props) {
  return (
    <div className="space-y-3">
      {!showFormDisp ? (
        <button onClick={onShowForm}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-green-300 text-green-600 rounded-xl text-sm font-semibold hover:bg-green-50">
          <Plus className="w-4 h-4" /> Reportar disponibilidad
        </button>
      ) : (
        <div className="bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-green-900 rounded-xl p-3 space-y-3">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">¿Qué días atiende?</p>
          <div className="flex flex-wrap gap-1.5">
            {DIAS.map((dia) => (
              <button key={dia} onClick={() => onToggleDia(dia)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  formDisp.dias.includes(dia) ? "bg-green-600 text-white" : "bg-white text-gray-600 border border-gray-300"
                }`}>{dia}</button>
            ))}
          </div>

          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Horario</p>
          <div className="flex gap-1.5">
            {HORARIOS.map((h) => (
              <button key={h} onClick={() => onFormDispChange("horario", h)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  formDisp.horario === h ? "bg-green-600 text-white" : "bg-white text-gray-600 border border-gray-300"
                }`}>{h}</button>
            ))}
          </div>

          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">¿Cómo se atiende?</p>
          <div className="flex flex-col gap-1.5">
            {TIPOS_TURNO.map((t) => (
              <button key={t} onClick={() => onFormDispChange("tipoTurno", t)}
                className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                  formDisp.tipoTurno === t ? "bg-green-600 text-white" : "bg-white text-gray-600 border border-gray-300"
                }`}>{t}</button>
            ))}
          </div>

          <select value={formDisp.obraSocial}
            onChange={(e) => onFormDispChange("obraSocial", e.target.value)}
            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-2 bg-white dark:bg-gray-700">
            <option value="Todas">Todas las obras sociales</option>
            {OBRAS_SOCIALES.map((os) => <option key={os} value={os}>{os}</option>)}
          </select>

          <input type="text" placeholder="Nota opcional..."
            value={formDisp.nota}
            onChange={(e) => onFormDispChange("nota", e.target.value)}
            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-2 bg-white dark:bg-gray-700" />

          <div className="flex gap-2">
            <button onClick={onSubmitDisp}
              disabled={savingDisp || !formDisp.dias.length || !formDisp.horario || !formDisp.tipoTurno}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold disabled:opacity-40">
              {savingDisp ? "Guardando..." : "Confirmar"}
            </button>
            <button onClick={onHideForm}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {disponibilidades.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-4">Nadie reportó disponibilidad aún. ¡Sé el primero!</p>
      ) : (
        <div className="space-y-2">
          {disponibilidades.map((d) => (
            <div key={d.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{d.dias.join(", ")}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{d.horario}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{d.tipoTurno}</span>
                    {d.obraSocial !== "Todas" && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{d.obraSocial}</span>}
                  </div>
                  {d.nota && <p className="text-xs text-gray-500 mt-1 italic">"{d.nota}"</p>}
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">{formatFecha(d.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
