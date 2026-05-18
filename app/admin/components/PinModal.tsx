"use client";

import { useState } from "react";
import { KeyRound, X, Eye, EyeOff, Check } from "lucide-react";
import type { Professional } from "../types";

import { API_URL } from "@/lib/api/client";

interface Props {
  target: Professional;
  getToken: () => Promise<string | null>;
  onClose: () => void;
}

export function PinModal({ target, getToken, onClose }: Props) {
  const [pinValue, setPinValue] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [showPinVal, setShowPinVal] = useState(false);
  const [savingPin, setSavingPin] = useState(false);
  const [pinSaved, setPinSaved] = useState(false);

  async function savePin() {
    if (pinValue.length !== 4 || pinValue !== pinConfirm) return;
    setSavingPin(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/admin/professionals/${target.id}/pin`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinValue }),
      });
      if (res.ok) {
        setPinSaved(true);
        setTimeout(() => {
          setPinSaved(false);
          onClose();
        }, 1500);
      }
    } finally {
      setSavingPin(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 1300, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              Asignar PIN
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{target.nombre} {target.apellido}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Asigná un PIN de 4 dígitos. El profesional lo va a usar junto a su WhatsApp para acceder a su panel.
        </p>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              value={pinValue}
              onChange={e => setPinValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="PIN"
              type={showPinVal ? "text" : "password"}
              inputMode="numeric"
              maxLength={4}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-amber-500 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPinVal(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPinVal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <input
            value={pinConfirm}
            onChange={e => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="Confirmar PIN"
            type={showPinVal ? "text" : "password"}
            inputMode="numeric"
            maxLength={4}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-amber-500"
          />
          {pinValue.length === 4 && pinConfirm.length === 4 && (
            <p className={`text-xs text-center ${pinValue === pinConfirm ? "text-green-400" : "text-red-400"}`}>
              {pinValue === pinConfirm ? "Los PINs coinciden" : "Los PINs no coinciden"}
            </p>
          )}
        </div>

        <button
          onClick={savePin}
          disabled={pinValue.length !== 4 || pinValue !== pinConfirm || savingPin}
          className="mt-4 w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {pinSaved
            ? <><Check className="w-4 h-4 text-green-300" /> PIN guardado!</>
            : savingPin ? "Guardando..." : "Asignar PIN"}
        </button>
      </div>
    </div>
  );
}
