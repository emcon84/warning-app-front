"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { ComercioForm, AiExtra } from "../types";

interface Props {
  form: ComercioForm;
  setForm: React.Dispatch<React.SetStateAction<ComercioForm>>;
  aiExtra: AiExtra;
  setAiExtra: React.Dispatch<React.SetStateAction<AiExtra>>;
  aiOpen: boolean;
  setAiOpen: React.Dispatch<React.SetStateAction<boolean>>;
  aiLoading: boolean;
  onGenerarDescripcion: () => void;
  inputCls: string;
  textSec: string;
  textMut: string;
  border: string;
}

export function StepInfo({
  form, setForm, aiExtra, setAiExtra, aiOpen, setAiOpen,
  aiLoading, onGenerarDescripcion, inputCls, textSec, textMut, border,
}: Props) {
  const INPUT_CLS = `w-full px-4 py-3.5 rounded-2xl ${inputCls} text-base focus:outline-none transition-colors`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={`text-xs mb-1.5 block ${textSec}`}>
          Dirección <span className={textMut}>(opcional)</span>
        </label>
        <input
          value={form.direccion}
          onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
          placeholder="Ej: San Martín 1234"
          className={INPUT_CLS}
        />
      </div>

      <div>
        <label className={`text-xs mb-1.5 block ${textSec}`}>
          Horario <span className={textMut}>(opcional)</span>
        </label>
        <input
          value={form.horario}
          onChange={(e) => setForm((f) => ({ ...f, horario: e.target.value }))}
          placeholder="Ej: Lunes a Viernes 9 a 18hs, Sábados 9 a 13hs"
          className={INPUT_CLS}
        />
      </div>

      <div>
        <label className={`text-xs mb-1.5 flex items-center justify-between ${textSec}`}>
          <span>Descripción <span className={textMut}>(opcional)</span></span>
          <span className={textMut}>{form.descripcion.length}/500</span>
        </label>
        <textarea
          value={form.descripcion}
          onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value.slice(0, 500) }))}
          placeholder="Contá qué venden, qué los diferencia, si tienen delivery, etc."
          rows={4}
          className={`w-full px-4 py-3.5 rounded-2xl border ${inputCls} text-base focus:outline-none transition-colors resize-none`}
        />

        {!aiOpen ? (
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-2xl border border-indigo-800 text-indigo-400 hover:bg-indigo-900/30 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> Generar con IA
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-4 rounded-2xl border border-indigo-800 bg-indigo-950/30"
          >
            <p className="text-xs font-medium mb-3 text-indigo-300">
              Una pregunta rápida y la IA escribe el borrador
            </p>
            <input
              value={aiExtra.zona}
              onChange={(e) => setAiExtra({ zona: e.target.value })}
              placeholder="Zonas donde entregan / donde atienden (opcional)"
              className={`w-full px-4 py-3 rounded-2xl border ${inputCls} text-sm focus:outline-none transition-colors`}
            />
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={onGenerarDescripcion}
                disabled={aiLoading}
                className="flex-1 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {aiLoading ? "Generando..." : "Generar descripción"}
              </button>
              <button
                type="button"
                onClick={() => setAiOpen(false)}
                className={`px-4 py-2.5 rounded-2xl text-xs border ${border} ${textSec} hover:border-gray-600 transition-colors`}
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
