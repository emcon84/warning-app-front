"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { ProfesionalForm, AiForm } from "../types";

interface Props {
  form: ProfesionalForm;
  setForm: React.Dispatch<React.SetStateAction<ProfesionalForm>>;
  aiForm: AiForm;
  setAiForm: React.Dispatch<React.SetStateAction<AiForm>>;
  aiOpen: boolean;
  setAiOpen: React.Dispatch<React.SetStateAction<boolean>>;
  aiLoading: boolean;
  onGenerarDescripcion: () => void;
  error: string;
  inputCls: string;
  isDark: boolean;
  textSec: string;
  textMut: string;
  border: string;
}

export function StepPerfil({
  form,
  setForm,
  aiForm,
  setAiForm,
  aiOpen,
  setAiOpen,
  aiLoading,
  onGenerarDescripcion,
  error,
  inputCls,
  isDark,
  textSec,
  textMut,
  border,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={`text-xs mb-1.5 flex items-center justify-between ${textSec}`}>
          <span>Descripción</span>
          <span className={textMut}>{form.descripcion.length}/500, mínimo 30</span>
        </label>
        <textarea
          value={form.descripcion}
          onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value.slice(0, 500) }))}
          placeholder="Contá qué hacés, cómo trabajás, en qué zonas atendés."
          rows={5}
          className={`w-full px-4 py-3.5 rounded-2xl border ${inputCls} text-base focus:outline-none transition-colors resize-none`}
        />
        {form.descripcion.length > 0 && form.descripcion.length < 30 && (
          <p className="text-xs text-yellow-500 mt-1">
            Faltan {30 - form.descripcion.length} caracteres más.
          </p>
        )}

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
              Dos preguntas rápidas y la IA escribe el borrador
            </p>
            <div className="flex flex-col gap-2">
              <input
                value={aiForm.anios}
                onChange={(e) => setAiForm((f) => ({ ...f, anios: e.target.value }))}
                placeholder="Años de experiencia (ej: 10)"
                inputMode="numeric"
                className={`w-full px-4 py-3 rounded-2xl border ${inputCls} text-sm focus:outline-none transition-colors`}
              />
              <input
                value={aiForm.zona}
                onChange={(e) => setAiForm((f) => ({ ...f, zona: e.target.value }))}
                placeholder="Zonas donde trabajás (ej: Centro, Barrio Norte)"
                className={`w-full px-4 py-3 rounded-2xl border ${inputCls} text-sm focus:outline-none transition-colors`}
              />
            </div>
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

      <div>
        <label className={`text-xs mb-1.5 block ${textSec}`}>
          Experiencia <span className={textMut}>(opcional)</span>
        </label>
        <textarea
          value={form.experiencia}
          onChange={(e) => setForm((f) => ({ ...f, experiencia: e.target.value.slice(0, 300) }))}
          placeholder="Ej: 10 años trabajando en Reconquista. Hice la instalación eléctrica del Colegio X..."
          rows={3}
          className={`w-full px-4 py-3.5 rounded-2xl border ${inputCls} text-base focus:outline-none transition-colors resize-none`}
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
