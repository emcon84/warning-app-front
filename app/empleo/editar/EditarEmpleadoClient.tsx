"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { CheckCircle, User } from "lucide-react";
import { Empleado } from "../../types";
import Navbar from "../../components/Navbar";
import { useTheme } from "../../contexts/ThemeContext";

import { API_URL } from "../../lib/api/client";

const BARRIOS = [
  "Centro",
  "Barrio Norte",
  "Barrio Sur",
  "Barrio Oeste",
  "Villa del Parque",
  "Las Lomas",
  "Parque Industrial",
  "Barrio Newbery",
  "Los Lapachos",
  "San Cayetano",
  "Otro",
];

const HABILIDADES_SUGERIDAS = [
  "Administración",
  "Atención al cliente",
  "Caja y cobranzas",
  "Cocina",
  "Contabilidad",
  "Diseño gráfico",
  "Electricidad",
  "Enfermería",
  "Gastronomía",
  "Informática",
  "Limpieza",
  "Logística",
  "Mantenimiento",
  "Marketing",
  "Mecánica",
  "Panadería",
  "Plomería",
  "Recepción",
  "Seguridad",
  "Ventas",
];

export default function EditarEmpleadoClient() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [empleado, setEmpleado] = useState<Empleado | null>(null);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [barrio, setBarrio] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [disponible, setDisponible] = useState(true);
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [habilidadInput, setHabilidadInput] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/profesionales");
      return;
    }
    getToken().then(async (token) => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/empleados/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          router.push("/empleo/nuevo");
          return;
        }
        const data: Empleado = await res.json();
        setEmpleado(data);
        setNombre(data.nombre);
        setApellido(data.apellido);
        setDescripcion(data.descripcion ?? "");
        setBarrio(data.barrio ?? "");
        setWhatsapp(data.whatsapp ?? "");
        setDisponible(data.disponible);
        setHabilidades(data.habilidades);
        if (data.foto) setFotoPreview(data.foto);
      } catch {
        router.push("/empleo/nuevo");
      } finally {
        setLoading(false);
      }
    });
  }, [isLoaded, isSignedIn]);

  function addHabilidad(h: string) {
    const clean = h.trim();
    if (!clean || habilidades.includes(clean)) return;
    setHabilidades((prev) => [...prev, clean]);
  }

  function removeHabilidad(h: string) {
    setHabilidades((prev) => prev.filter((x) => x !== h));
  }

  function handleHabilidadKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addHabilidad(habilidadInput);
      setHabilidadInput("");
    }
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!nombre.trim() || !apellido.trim() || habilidades.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No autorizado");
      const fd = new FormData();
      fd.append("nombre", nombre.trim());
      fd.append("apellido", apellido.trim());
      fd.append("habilidades", habilidades.join(","));
      fd.append("descripcion", descripcion.trim());
      fd.append("barrio", barrio);
      fd.append("whatsapp", whatsapp.trim());
      fd.append("disponible", String(disponible));
      if (foto) fd.append("photo", foto);

      const res = await fetch(`${API_URL}/api/empleados/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }
      const updated: Empleado = await res.json();
      setSaved(true);
      setTimeout(() => router.push(`/empleo/${updated.slug}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const cardBg = isDark
    ? "bg-gray-900 border-gray-800"
    : "bg-white border-gray-200 shadow-sm";
  const inputClass = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500";
  const labelClass = isDark ? "text-gray-300" : "text-gray-700";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";

  if (!isLoaded || loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (saved) {
    return (
      <div
        className={`min-h-screen ${bg} flex items-center justify-center flex-col gap-4`}
      >
        <CheckCircle className="w-12 h-12 text-green-400" />
        <p
          className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Perfil actualizado
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} pb-40 md:pb-0`}>
      <Navbar
        totalReports={0}
        onMenuClick={() => {}}
        sidebarDisabled
        mapView="profesionales"
      />
      <div className="max-w-lg mx-auto px-4 py-8 mt-24">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-xl transition-colors ${isDark ? "bg-gray-800 text-gray-400 hover:text-white" : "bg-white text-gray-500 hover:text-gray-900 shadow-sm"}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1
            className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Editar perfil
          </h1>
        </div>

        <div className={`rounded-2xl border p-6 flex flex-col gap-5 ${cardBg}`}>
          {/* Foto */}
          <div className="flex flex-col items-center gap-3">
            <label className="cursor-pointer group">
              <div
                className={`w-24 h-24 rounded-full overflow-hidden border-2 transition-all ${isDark ? "border-gray-700 group-hover:border-blue-500" : "border-gray-200 group-hover:border-blue-400"}`}
              >
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                  >
                    <User
                      className={`w-10 h-10 ${isDark ? "text-gray-600" : "text-gray-400"}`}
                    />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoChange}
              />
            </label>
            <p className={`text-xs ${textSec}`}>Toca para cambiar la foto</p>
          </div>

          {/* Nombre / Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={`text-sm font-medium ${labelClass}`}>
                Nombre *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`text-sm font-medium ${labelClass}`}>
                Apellido *
              </label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
              />
            </div>
          </div>

          {/* Habilidades */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-sm font-medium ${labelClass}`}>
              Habilidades *
            </label>
            <div
              className={`flex flex-wrap gap-2 p-3 rounded-xl border min-h-[48px] ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
            >
              {habilidades.map((h) => (
                <span
                  key={h}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? "bg-blue-900/50 text-blue-300 border border-blue-700" : "bg-blue-50 text-blue-700 border border-blue-200"}`}
                >
                  {h}
                  <button
                    onClick={() => removeHabilidad(h)}
                    className="ml-0.5 opacity-60 hover:opacity-100"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={habilidadInput}
                onChange={(e) => setHabilidadInput(e.target.value)}
                onKeyDown={handleHabilidadKeyDown}
                placeholder="Agregar habilidad..."
                className={`flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none ${isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {HABILIDADES_SUGERIDAS.filter((h) => !habilidades.includes(h))
                .slice(0, 8)
                .map((h) => (
                  <button
                    key={h}
                    onClick={() => addHabilidad(h)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-colors ${isDark ? "bg-gray-800 text-gray-400 hover:text-white border border-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"}`}
                  >
                    + {h}
                  </button>
                ))}
            </div>
          </div>

          {/* Descripcion */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-sm font-medium ${labelClass}`}>
              Descripcion
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors resize-none ${inputClass}`}
            />
          </div>

          {/* Barrio / WhatsApp */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={`text-sm font-medium ${labelClass}`}>
                Barrio
              </label>
              <select
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
              >
                <option value="">Sin especificar</option>
                {BARRIOS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`text-sm font-medium ${labelClass}`}>
                WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="3482123456"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
              />
            </div>
          </div>

          {/* Disponible toggle */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}
          >
            <div>
              <p
                className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Disponible para trabajar
              </p>
              <p className={`text-xs ${textSec}`}>Se muestra en el buscador.</p>
            </div>
            <button
              onClick={() => setDisponible((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${disponible ? "bg-blue-600" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${disponible ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-700 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={
              saving ||
              !nombre.trim() ||
              !apellido.trim() ||
              habilidades.length === 0
            }
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
