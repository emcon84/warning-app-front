"use client";

import { Lock, Eye, EyeOff } from "lucide-react";
import type { ProfesionalForm } from "../types";

interface Props {
  form: ProfesionalForm;
  setForm: React.Dispatch<React.SetStateAction<ProfesionalForm>>;
  whatsappRaw: string;
  onWhatsappChange: (raw: string) => void;
  showPin: boolean;
  setShowPin: React.Dispatch<React.SetStateAction<boolean>>;
  inputCls: string;
  isDark: boolean;
  textSec: string;
  textMut: string;
}

export function StepDatos({
  form,
  setForm,
  whatsappRaw,
  onWhatsappChange,
  showPin,
  setShowPin,
  inputCls,
  isDark,
  textSec,
  textMut,
}: Props) {
  const INPUT_CLS = `w-full px-4 py-3.5 rounded-2xl ${inputCls} text-base focus:outline-none transition-colors`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={`text-xs mb-1.5 block ${textSec}`}>Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder="Juan"
            className={INPUT_CLS}
          />
        </div>
        <div className="flex-1">
          <label className={`text-xs mb-1.5 block ${textSec}`}>Apellido</label>
          <input
            value={form.apellido}
            onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))}
            placeholder="Garcia"
            className={INPUT_CLS}
          />
        </div>
      </div>

      <div>
        <label className={`text-xs mb-1.5 block ${textSec}`}>WhatsApp</label>
        <input
          value={whatsappRaw}
          onChange={(e) => onWhatsappChange(e.target.value)}
          placeholder="3482 123456"
          inputMode="numeric"
          className={INPUT_CLS}
        />
        {form.whatsapp.length >= 6 && (
          <p className="text-xs mt-1.5 text-green-400">
            Listo: wa.me/{form.whatsapp}
          </p>
        )}
        {whatsappRaw && form.whatsapp.length < 6 && (
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
          type="tel"
          inputMode="numeric"
          className={INPUT_CLS}
        />
        <p className={`text-xs mt-1 ${textMut}`}>
          Solo se comparte cuando acordas con un cliente.
        </p>
      </div>

      <div className={`rounded-2xl border p-4 ${isDark ? "bg-blue-950/30 border-blue-800/40" : "bg-blue-50 border-blue-200"}`}>
        <div className="flex items-center gap-2 mb-1">
          <Lock className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
          <p className={`text-sm font-semibold ${isDark ? "text-blue-300" : "text-blue-700"}`}>
            Elegí un PIN de 4 dígitos
          </p>
        </div>
        <p className={`text-xs mb-3 ${isDark ? "text-blue-400/70" : "text-blue-600/70"}`}>
          Con tu WhatsApp + este PIN vas a poder gestionar tu perfil desde cualquier dispositivo.
        </p>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              value={form.pin}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                setForm((f) => ({ ...f, pin: v }));
              }}
              placeholder="1234"
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              maxLength={4}
              className={`${INPUT_CLS} pr-12 text-center text-2xl tracking-[0.5em] font-bold`}
            />
            <button
              type="button"
              onClick={() => setShowPin((v) => !v)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <input
            value={form.pinConfirm}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 4);
              setForm((f) => ({ ...f, pinConfirm: v }));
            }}
            placeholder="Repetí el PIN"
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            maxLength={4}
            className={`${INPUT_CLS} text-center text-2xl tracking-[0.5em] font-bold`}
          />
          {form.pin.length === 4 && form.pinConfirm.length === 4 && (
            <p className={`text-xs text-center font-medium ${form.pin === form.pinConfirm ? "text-green-400" : "text-red-400"}`}>
              {form.pin === form.pinConfirm ? "Los PINs coinciden" : "Los PINs no coinciden"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
