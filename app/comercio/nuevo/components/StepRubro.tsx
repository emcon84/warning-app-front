"use client";

import { Check, X } from "lucide-react";
import { RUBROS } from "../constants";
import type { ComercioForm } from "../types";

interface Props {
  form: ComercioForm;
  setForm: React.Dispatch<React.SetStateAction<ComercioForm>>;
  chipBase: string;
  inputCls: string;
  textMut: string;
}

export function StepRubro({ form, setForm, chipBase, inputCls, textMut }: Props) {
  const INPUT_CLS = `w-full px-4 py-3.5 rounded-2xl ${inputCls} text-base focus:outline-none transition-colors`;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <input
          value={form.rubro}
          onChange={(e) => setForm((f) => ({ ...f, rubro: e.target.value }))}
          placeholder="Ej: Florería, Carpintería, Kiosco..."
          className={INPUT_CLS}
        />
        {form.rubro && (
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, rubro: "" }))}
            className={`absolute right-4 top-1/2 -translate-y-1/2 ${textMut}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className={`text-xs ${textMut} mt-1`}>O elegí de la lista:</p>

      {RUBROS
        .filter((r) => !form.rubro || r.toLowerCase().includes(form.rubro.toLowerCase()))
        .map((r) => {
          const selected = form.rubro === r;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setForm((f) => ({ ...f, rubro: r }))}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-left text-sm font-medium transition-all ${
                selected
                  ? "bg-amber-500/10 border-amber-500 text-amber-400"
                  : chipBase
              }`}
            >
              <span>{r}</span>
              {selected && <Check className="w-4 h-4 flex-shrink-0 ml-2" />}
            </button>
          );
        })}
    </div>
  );
}
