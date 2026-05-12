"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Check } from "lucide-react";
import type { Comercio } from "../../../types";
import { RUBROS, BARRIOS } from "../../../lib/constants/storeConstants";

import { API_URL } from "../../../lib/api/client";

interface Props {
  comercio: Comercio;
  isDark: boolean;
  onComercioUpdate: (updated: Partial<Comercio>) => void;
}

export function StoreDataTab({ comercio, isDark, onComercioUpdate }: Props) {
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    nombre: comercio.nombre ?? "",
    rubro: comercio.rubro ?? "",
    barrio: comercio.barrio ?? "",
    whatsapp: comercio.whatsapp ?? "",
    telefono: comercio.telefono ?? "",
    direccion: comercio.direccion ?? "",
    horario: comercio.horario ?? "",
    descripcion: comercio.descripcion ?? "",
  });
  const [aceptaEnvios, setAceptaEnvios] = useState(comercio.aceptaEnvios ?? false);
  const [zonaEnvio, setZonaEnvio] = useState(comercio.zonaEnvio ?? "");
  const [costoEnvio, setCostoEnvio] = useState(comercio.costoEnvio ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted = isDark ? "text-gray-600" : "text-gray-400";
  const inputCls = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-gray-500"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400";
  const inputColor = isDark ? "#f9fafb" : "#111827";
  const inputBg = isDark ? "#1f2937" : "#ffffff";

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("nombre", form.nombre.trim());
      fd.append("rubro", form.rubro);
      fd.append("barrio", form.barrio);
      fd.append("whatsapp", form.whatsapp.trim());
      fd.append("telefono", form.telefono.trim());
      fd.append("direccion", form.direccion.trim());
      fd.append("horario", form.horario.trim());
      fd.append("descripcion", form.descripcion.trim());
      fd.append("aceptaEnvios", String(aceptaEnvios));
      if (zonaEnvio) fd.append("zonaEnvio", zonaEnvio);
      if (costoEnvio) fd.append("costoEnvio", costoEnvio);

      const res = await fetch(`/api/comercios/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al guardar");
      }
      const updated = await res.json();
      onComercioUpdate(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`rounded-2xl border p-5 ${cardBg}`}>
      <div className="flex flex-col gap-4">
        {[
          { label: "Nombre del comercio", key: "nombre", placeholder: "Ej: Almacén El Cruce" },
          { label: "WhatsApp", key: "whatsapp", placeholder: "Ej: 3482123456" },
          { label: "Telefono", key: "telefono", placeholder: "Ej: 03482-XXXXXX", optional: true },
          { label: "Direccion", key: "direccion", placeholder: "Ej: San Martín 1234", optional: true },
          { label: "Horario", key: "horario", placeholder: "Ej: Lunes a Viernes 9 a 18hs", optional: true },
        ].map(({ label, key, placeholder, optional }) => (
          <div key={key}>
            <label className={`text-xs mb-1.5 block ${textSec}`}>
              {label} {optional && <span className={textMuted}>(opcional)</span>}
            </label>
            <input
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              style={{ color: inputColor, backgroundColor: inputBg }}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
            />
          </div>
        ))}

        <div>
          <label className={`text-xs mb-1.5 block ${textSec}`}>Rubro</label>
          <select
            value={form.rubro}
            onChange={(e) => setForm((f) => ({ ...f, rubro: e.target.value }))}
            style={{ color: inputColor, backgroundColor: inputBg }}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
          >
            {RUBROS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className={`text-xs mb-1.5 block ${textSec}`}>Barrio</label>
          <select
            value={form.barrio}
            onChange={(e) => setForm((f) => ({ ...f, barrio: e.target.value }))}
            style={{ color: inputColor, backgroundColor: inputBg }}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
          >
            {BARRIOS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label className={`text-xs mb-1.5 block ${textSec}`}>
            Descripcion <span className={textMuted}>({form.descripcion.length}/500)</span>
          </label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value.slice(0, 500) }))}
            placeholder="Que venden, horarios especiales, delivery, etc."
            rows={4}
            style={{ color: inputColor, backgroundColor: inputBg }}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none resize-none ${inputCls}`}
          />
        </div>

        <div className={`rounded-2xl border p-4 ${isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className={`text-sm font-semibold ${textPri}`}>Envios a domicilio</p>
              <p className={`text-xs ${textMuted}`}>Tus clientes veran si hacen envios al armar el pedido</p>
            </div>
            <button
              type="button"
              onClick={() => setAceptaEnvios(!aceptaEnvios)}
              className={`relative w-11 h-6 rounded-full transition-colors ${aceptaEnvios ? "bg-amber-500" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${aceptaEnvios ? "translate-x-5" : ""}`} />
            </button>
          </div>
          {aceptaEnvios && (
            <div className="flex flex-col gap-2 mt-2">
              <input
                type="text"
                placeholder="Zona de envio (ej: Toda la ciudad, Centro)"
                value={zonaEnvio}
                onChange={(e) => setZonaEnvio(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
              />
              <input
                type="text"
                placeholder="Costo de envio (ej: Gratis, $500, A coordinar)"
                value={costoEnvio}
                onChange={(e) => setCostoEnvio(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
              />
            </div>
          )}
        </div>

        {error && (
          <p className={`text-sm px-3 py-2 rounded-xl border ${isDark ? "text-red-400 bg-red-900/20 border-red-800" : "text-red-600 bg-red-50 border-red-200"}`}>
            {error}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saved
            ? <><Check className="w-4 h-4 text-green-600" /> Guardado</>
            : saving ? "Guardando..." : "Guardar cambios"
          }
        </button>
      </div>
    </div>
  );
}
