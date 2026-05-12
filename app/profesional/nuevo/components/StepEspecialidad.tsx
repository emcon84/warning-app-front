"use client";

import { OFICIOS_SUGERIDOS, PROFESIONES_SUGERIDAS } from "../constants";
import type { ProfesionalForm } from "../types";

interface Props {
  form: ProfesionalForm;
  setForm: React.Dispatch<React.SetStateAction<ProfesionalForm>>;
  onToggleOficio: (oficio: string) => void;
  onAddCustomOficio: () => void;
  chipBase: string;
  chipSel: string;
  inputCls: string;
  textSec: string;
  textMut: string;
}

export function StepEspecialidad({
  form,
  setForm,
  onToggleOficio,
  onAddCustomOficio,
  chipBase,
  chipSel,
  inputCls,
  textSec,
  textMut,
}: Props) {
  const categoriasSugeridas = form.tipo === "oficio" ? OFICIOS_SUGERIDOS : PROFESIONES_SUGERIDAS;
  const tipoLabel = form.tipo === "profesion" ? "profesión" : "oficio";
  const tipoLabelPlural = form.tipo === "profesion" ? "profesiones" : "oficios";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        {(["oficio", "profesion"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setForm((f) => ({ ...f, tipo: t, oficios: [], oficioCustom: "" }))}
            className={`flex-1 px-3 py-2.5 rounded-2xl text-sm font-semibold border transition-all ${
              form.tipo === t ? "bg-indigo-500 border-indigo-500 text-white" : chipBase
            }`}
          >
            {t === "oficio" ? "Oficio" : "Profesión"}
          </button>
        ))}
      </div>

      {form.tipo === "" && (
        <p className={`text-sm text-center py-4 ${textMut}`}>
          Seleccioná una opción para continuar.
        </p>
      )}

      {form.tipo !== "" && (
        <>
          <p className={`text-sm ${textSec}`}>Elegí hasta 3 {tipoLabelPlural}.</p>

          <div className="flex flex-wrap gap-2">
            {categoriasSugeridas.map((o) => (
              <button
                key={o}
                onClick={() => onToggleOficio(o)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all cursor-pointer ${
                  form.oficios.includes(o) ? chipSel : chipBase
                }`}
              >
                {o}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={form.oficioCustom}
              onChange={(e) => setForm((f) => ({ ...f, oficioCustom: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && onAddCustomOficio()}
              placeholder={`Otra ${tipoLabel}... (Enter)`}
              className={`flex-1 px-4 py-3 rounded-2xl border ${inputCls} text-sm focus:outline-none transition-colors`}
            />
            <button
              onClick={onAddCustomOficio}
              className={`px-4 py-3 rounded-2xl border ${chipBase} text-sm transition-colors`}
            >
              Agregar
            </button>
          </div>

          {form.oficios.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.oficios.map((o) => (
                <span
                  key={o}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm ${chipSel}`}
                >
                  {o}
                  <button onClick={() => onToggleOficio(o)} className="hover:opacity-70">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
