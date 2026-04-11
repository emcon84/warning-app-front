"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Navbar from "../../components/Navbar";
import { Bell, CheckCircle } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const BARRIOS = [
  "Centro", "Barrio Norte", "Barrio Sur", "Barrio Oeste", "Villa del Parque",
  "Las Lomas", "Parque Industrial", "Barrio Newbery", "Villa Ocampo",
  "Los Lapachos", "San Cayetano", "Otro",
];

const OFICIOS_SUGERIDOS = [
  "Plomería", "Electricidad", "Albañilería", "Pintura", "Gasista",
  "Jardinería", "Herrería", "Carpintería", "Climatización", "Cerrajería",
  "Techado", "Soldadura", "Fumigación", "Limpieza", "Fletes",
];

function Step4Notificaciones({
  permission,
  isSupported,
  requestPermission,
  onFinish,
}: {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  onFinish: () => void;
}) {
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (permission === "granted") {
      const t = setTimeout(onFinish, 1200);
      return () => clearTimeout(t);
    }
  }, [permission, onFinish]);

  async function handleActivar() {
    setActivating(true);
    await requestPermission();
    setActivating(false);
  }

  if (permission === "granted") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-700 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-white font-semibold text-lg">Notificaciones activadas</p>
        <p className="text-sm text-gray-400 text-center">Te vamos a avisar cuando un cliente te contacte.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-blue-950/60 border border-blue-800 flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-xl font-bold mb-1">Activa las notificaciones</h1>
        <p className="text-sm text-gray-400">Para saber cuando un cliente te contacta</p>
      </div>

      {!isSupported && (
        <p className="text-xs text-gray-500 text-center mb-6">
          Tu navegador no soporta notificaciones push. Podras activarlas despues desde tu perfil.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {isSupported && (
          <button
            onClick={handleActivar}
            disabled={activating}
            className="w-full py-3.5 rounded-2xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-60"
          >
            {activating ? "Activando..." : "Activar notificaciones"}
          </button>
        )}
        <button
          onClick={onFinish}
          className="w-full py-3.5 rounded-2xl bg-gray-800 text-gray-300 font-semibold text-sm hover:bg-gray-700 transition-colors"
        >
          Omitir por ahora
        </button>
      </div>
    </div>
  );
}

export default function NuevoProfesionalClient() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { permission, isSupported, requestPermission } = useNotifications();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    barrio: "",
    telefono: "",
    whatsapp: "",
    oficios: [] as string[],
    oficioCustom: "",
    descripcion: "",
    experiencia: "",
  });

  function toggleOficio(oficio: string) {
    setForm((f) => ({
      ...f,
      oficios: f.oficios.includes(oficio)
        ? f.oficios.filter((o) => o !== oficio)
        : f.oficios.length < 3
          ? [...f.oficios, oficio]
          : f.oficios,
    }));
  }

  function addCustomOficio() {
    const val = form.oficioCustom.trim();
    if (!val || form.oficios.includes(val) || form.oficios.length >= 3) return;
    setForm((f) => ({ ...f, oficios: [...f.oficios, val], oficioCustom: "" }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const descripcionFinal = [
        form.descripcion,
        form.experiencia ? `\n\nExperiencia: ${form.experiencia}` : "",
      ].join("").trim();

      const res = await fetch(`${API}/api/professionals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          barrio: form.barrio,
          telefono: form.telefono,
          whatsapp: form.whatsapp,
          oficios: form.oficios.map((o) => o.toLowerCase()),
          descripcion: descripcionFinal,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear perfil");
      }

      const pro = await res.json();
      setCreatedSlug(pro.slug);
      setStep(4);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const canGoStep2 = form.nombre && form.apellido && form.barrio;
  const canGoStep3 = form.oficios.length > 0;
  const canSubmit = form.descripcion.length >= 30;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar sidebarDisabled />

      <div className="flex-1 max-w-xl mx-auto w-full px-4 pt-24 pb-12">

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                s < step ? "bg-green-500 text-white" :
                s === step ? "bg-white text-gray-900" :
                "bg-gray-800 text-gray-500"
              }`}>
                {s < step ? "✓" : s}
              </div>
              {s < 4 && <div className={`h-px flex-1 transition-colors ${s < step ? "bg-green-500" : "bg-gray-700"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 — Datos personales */}
        {step === 1 && (
          <div>
            <h1 className="text-xl font-bold mb-1">Tus datos</h1>
            <p className="text-sm text-gray-400 mb-6">Cómo te van a ver los clientes.</p>

            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1.5 block">Nombre</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    placeholder="Juan"
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1.5 block">Apellido</label>
                  <input
                    value={form.apellido}
                    onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))}
                    placeholder="García"
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Barrio donde trabajás</label>
                <select
                  value={form.barrio}
                  onChange={(e) => setForm((f) => ({ ...f, barrio: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-gray-500 text-sm"
                >
                  <option value="">Seleccioná un barrio</option>
                  {BARRIOS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Teléfono</label>
                <input
                  value={form.telefono}
                  onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                  placeholder="03482-XXXXXX"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
                />
                <p className="text-xs text-gray-600 mt-1">Solo se comparte cuando acordás con un cliente.</p>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">WhatsApp <span className="text-gray-600">(opcional)</span></label>
                <input
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                  placeholder="5493482XXXXXX"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canGoStep2}
              className="w-full mt-8 py-3.5 rounded-2xl bg-white text-gray-900 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 2 — Oficios */}
        {step === 2 && (
          <div>
            <h1 className="text-xl font-bold mb-1">¿Qué hacés?</h1>
            <p className="text-sm text-gray-400 mb-6">Elegí hasta 3 oficios. Los clientes te van a encontrar por estos.</p>

            <div className="flex flex-wrap gap-2 mb-5">
              {OFICIOS_SUGERIDOS.map((o) => (
                <button
                  key={o}
                  onClick={() => toggleOficio(o)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    form.oficios.includes(o)
                      ? "bg-white text-gray-900 border-white"
                      : "bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500"
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
                onKeyDown={(e) => e.key === "Enter" && addCustomOficio()}
                placeholder="Otro oficio..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
              />
              <button
                onClick={addCustomOficio}
                className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm border border-gray-700"
              >
                Agregar
              </button>
            </div>

            {form.oficios.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {form.oficios.map((o) => (
                  <span key={o} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-900/50 text-green-400 border border-green-800 text-sm">
                    {o}
                    <button onClick={() => toggleOficio(o)} className="hover:text-green-200">✕</button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-2xl bg-gray-800 text-gray-300 font-semibold text-sm hover:bg-gray-700 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canGoStep3}
                className="flex-1 py-3.5 rounded-2xl bg-white text-gray-900 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Notificaciones */}
        {step === 4 && (
          <Step4Notificaciones
            permission={permission}
            isSupported={isSupported}
            requestPermission={requestPermission}
            onFinish={() => router.push(`/profesional/${createdSlug}`)}
          />
        )}

        {/* Step 3 — Perfil */}
        {step === 3 && (
          <div>
            <h1 className="text-xl font-bold mb-1">Tu perfil</h1>
            <p className="text-sm text-gray-400 mb-6">Contale a los clientes quién sos y qué hacés. Esto es lo primero que van a leer.</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">
                  Descripción <span className="text-gray-600">({form.descripcion.length}/500)</span>
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value.slice(0, 500) }))}
                  placeholder="Contá qué hacés, cómo trabajás, en qué zonas atendés. Cuanto más claro, mejor."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm resize-none"
                />
                {form.descripcion.length > 0 && form.descripcion.length < 30 && (
                  <p className="text-xs text-yellow-600 mt-1">Mínimo 30 caracteres.</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">
                  Años de experiencia y trabajos destacados <span className="text-gray-600">(opcional)</span>
                </label>
                <textarea
                  value={form.experiencia}
                  onChange={(e) => setForm((f) => ({ ...f, experiencia: e.target.value.slice(0, 300) }))}
                  placeholder="Ej: 10 años trabajando en Reconquista. Hice la instalación eléctrica del Colegio X, el barrio Y..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm resize-none"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">{error}</p>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 rounded-2xl bg-gray-800 text-gray-300 font-semibold text-sm hover:bg-gray-700 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="flex-1 py-3.5 rounded-2xl bg-white text-gray-900 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                {loading ? "Creando perfil..." : "Publicar perfil"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
