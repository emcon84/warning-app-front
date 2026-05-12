"use client";

import type { ComercioForm } from "../types";

interface Props {
  form: ComercioForm;
  setForm: React.Dispatch<React.SetStateAction<ComercioForm>>;
  whatsappRaw: string;
  onWhatsappChange: (raw: string) => void;
  inputCls: string;
  textSec: string;
  textMut: string;
}

export function StepContacto({ form, setForm, whatsappRaw, onWhatsappChange, inputCls, textSec, textMut }: Props) {
  const INPUT_CLS = `w-full px-4 py-3.5 rounded-2xl ${inputCls} text-base focus:outline-none transition-colors`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={`text-xs mb-1.5 block ${textSec}`}>Nombre del comercio</label>
        <input
          value={form.nombre}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          placeholder="Ej: Almacén El Cruce"
          className={INPUT_CLS}
        />
      </div>

      <div>
        <label className={`text-xs mb-1.5 block ${textSec}`}>WhatsApp</label>
        <input
          value={whatsappRaw}
          onChange={(e) => onWhatsappChange(e.target.value)}
          placeholder="Ej: 3482 123456"
          inputMode="numeric"
          className={INPUT_CLS}
        />
        {form.whatsapp.length >= 11 && (
          <p className="text-xs mt-1.5 text-green-400">Listo: wa.me/{form.whatsapp}</p>
        )}
        {whatsappRaw && form.whatsapp.length < 11 && (
          <p className="text-xs mt-1.5 text-yellow-500">Número incompleto.</p>
        )}
      </div>

      <div>
        <label className={`text-xs mb-1.5 block ${textSec}`}>
          Teléfono <span className={textMut}>(opcional)</span>
        </label>
        <input
          value={form.telefono}
          onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
          placeholder="03482-XXXXXX"
          className={INPUT_CLS}
        />
      </div>
    </div>
  );
}
