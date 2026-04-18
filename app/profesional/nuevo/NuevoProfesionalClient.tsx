"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Navbar from "../../components/Navbar";
import { Bell, CheckCircle } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useTheme } from "../../contexts/ThemeContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const BARRIOS = [
  "Centro",
  "Barrio Norte",
  "Barrio Sur",
  "Barrio Oeste",
  "Villa del Parque",
  "Las Lomas",
  "Parque Industrial",
  "Barrio Newbery",
  "Villa Ocampo",
  "Los Lapachos",
  "San Cayetano",
  "Otro",
];

const OFICIOS_SUGERIDOS = [
  "Plomero",
  "Electricista",
  "Albañil",
  "Pintor",
  "Gasista",
  "Jardinero",
  "Herrero",
  "Carpintero",
  "Climatización",
  "Cerrajero",
  "Techista",
  "Soldador",
  "Fumigador",
  "Limpieza",
  "Flete",
  "Mecánico",
  "Yesero",
  "Instalador",
];

const PROFESIONES_SUGERIDAS = [
  "Desarrollador de software",
  "Contador",
  "Abogado",
  "Arquitecto",
  "Ingeniero",
  "Diseñador gráfico",
  "Marketing digital",
  "Administración",
  "Docente",
  "Psicólogo",
  "Community manager",
  "Analista de datos",
  "Traductor",
  "Consultor",
  "Escribano",
];

function Step4Notificaciones({
  isDark,
  permission,
  isSupported,
  requestPermission,
  onFinish,
}: {
  isDark: boolean;
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  onFinish: () => void;
}) {
  const [activating, setActivating] = useState(false);

  const textSec = isDark ? "text-gray-400" : "text-gray-500";
  const btnSecondary = isDark
    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
    : "bg-gray-100 text-gray-600 hover:bg-gray-200";

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
        <div
          className={`w-16 h-16 rounded-full border flex items-center justify-center ${
            isDark
              ? "bg-green-900/40 border-green-700"
              : "bg-green-100 border-green-300"
          }`}
        >
          <CheckCircle
            className={`w-8 h-8 ${isDark ? "text-green-400" : "text-green-600"}`}
          />
        </div>
        <p
          className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Notificaciones activadas
        </p>
        <p className={`text-sm text-center ${textSec}`}>
          Te vamos a avisar cuando un cliente te contacte.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center text-center mb-8">
        <div
          className={`w-16 h-16 rounded-full border flex items-center justify-center mb-4 ${
            isDark
              ? "bg-blue-950/60 border-blue-800"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <Bell
            className={`w-8 h-8 ${isDark ? "text-blue-400" : "text-blue-600"}`}
          />
        </div>
        <h1
          className={`text-xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Activa las notificaciones
        </h1>
        <p className={`text-sm ${textSec}`}>
          Para saber cuando un cliente te contacta
        </p>
      </div>

      {!isSupported && (
        <p
          className={`text-xs text-center mb-6 ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          Tu navegador no soporta notificaciones push. Podras activarlas despues
          desde tu perfil.
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
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-colors ${btnSecondary}`}
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

  const { isDark } = useTheme();
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
    tipo: "oficio" as "oficio" | "profesion",
    oficios: [] as string[],
    oficioCustom: "",
    descripcion: "",
    experiencia: "",
  });

  const [whatsappRaw, setWhatsappRaw] = useState("");

  const [aiForm, setAiForm] = useState({ anios: "", zona: "" });
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  async function handleGenerarDescripcion() {
    setAiLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/ai/generate-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oficios: form.oficios,
          nombre: form.nombre,
          barrio: form.barrio,
          anios: aiForm.anios || undefined,
          zona: aiForm.zona || undefined,
        }),
      });
      if (!res.ok) throw new Error("Error generando descripcion");
      const data = await res.json();
      setForm((f) => ({ ...f, descripcion: data.descripcion }));
      setAiOpen(false);
    } catch {
      // silently fail — user can write manually
    } finally {
      setAiLoading(false);
    }
  }

  function handleWhatsappChange(raw: string) {
    setWhatsappRaw(raw);
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setForm((f) => ({ ...f, whatsapp: "" }));
      return;
    }
    let formatted = digits;
    if (digits.startsWith("549")) {
      formatted = digits;
    } else if (digits.startsWith("54")) {
      formatted = "549" + digits.slice(2);
    } else if (digits.startsWith("0")) {
      formatted = "549" + digits.slice(1);
    } else {
      formatted = "549" + digits;
    }
    setForm((f) => ({ ...f, whatsapp: formatted }));
  }

  // Theme helpers
  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted = isDark ? "text-gray-600" : "text-gray-400";
  const inputCls = isDark
    ? "bg-gray-900 border-gray-700 placeholder-gray-500 focus:border-gray-500"
    : "bg-white border-gray-200 placeholder-gray-400 focus:border-gray-400";
  const inputColor = isDark ? "#f9fafb" : "#111827";
  const inputBg = isDark ? "#111827" : "#ffffff";
  const btnSecondary = isDark
    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200";
  const stepFuture = isDark
    ? "bg-gray-800 text-gray-500"
    : "bg-gray-200 text-gray-400";
  const stepLine = isDark ? "bg-gray-700" : "bg-gray-200";
  const tagActive = isDark
    ? "bg-white text-gray-900 border-white"
    : "bg-gray-900 text-white border-gray-900";
  const tagInactive = isDark
    ? "bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500"
    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400";
  const selectedTag = isDark
    ? "bg-green-900/50 text-green-400 border-green-800"
    : "bg-green-100 text-green-700 border-green-300";
  const customInput = isDark
    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-gray-500"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400";
  const addBtn = isDark
    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200";
  const errorCls = isDark
    ? "text-red-400 bg-red-900/20 border-red-800"
    : "text-red-600 bg-red-50 border-red-300";

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
      ]
        .join("")
        .trim();

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
          tipo: form.tipo,
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const canGoStep2 =
    form.nombre && form.apellido && form.barrio && form.whatsapp.length >= 11;
  const canGoStep3 = form.oficios.length > 0;
  const canSubmit = form.descripcion.length >= 30;
  const categoriasSugeridas =
    form.tipo === "oficio" ? OFICIOS_SUGERIDOS : PROFESIONES_SUGERIDAS;
  const tipoLabel = form.tipo === "oficio" ? "oficio" : "profesión";
  const tipoLabelPlural = form.tipo === "oficio" ? "oficios" : "profesiones";

  return (
    <div className={`min-h-screen ${bg} ${textPrimary} flex flex-col`}>
      <Navbar sidebarDisabled />

      <div className="flex-1 max-w-xl mx-auto w-full px-4 mt-24 mb-12">
        {/* Progress */}
        <div className="flex items-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <Fragment key={s}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                  s < step
                    ? "bg-green-500 text-white"
                    : s === step
                      ? isDark
                        ? "bg-white text-gray-900"
                        : "bg-gray-900 text-white"
                      : stepFuture
                }`}
              >
                {s < step ? "✓" : s}
              </div>
              {s < 4 && (
                <div
                  className={`h-px flex-1 mx-2 transition-colors ${s < step ? "bg-green-500" : stepLine}`}
                />
              )}
            </Fragment>
          ))}
        </div>

        {/* Step 1 — Datos personales */}
        {step === 1 && (
          <div>
            <h1 className={`text-xl font-bold mb-1 ${textPrimary}`}>
              Tus datos
            </h1>
            <p className={`text-sm mb-6 ${textSec}`}>
              Como te van a ver los clientes.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={`text-xs mb-1.5 block ${textSec}`}>
                    Nombre
                  </label>
                  <input
                    value={form.nombre}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nombre: e.target.value }))
                    }
                    placeholder="Juan"
                    style={{ color: inputColor, backgroundColor: inputBg }}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                  />
                </div>
                <div className="flex-1">
                  <label className={`text-xs mb-1.5 block ${textSec}`}>
                    Apellido
                  </label>
                  <input
                    value={form.apellido}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, apellido: e.target.value }))
                    }
                    placeholder="Garcia"
                    style={{ color: inputColor, backgroundColor: inputBg }}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>
                  Barrio donde trabajas
                </label>
                <select
                  value={form.barrio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, barrio: e.target.value }))
                  }
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                >
                  <option value="">Selecciona un barrio</option>
                  {BARRIOS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>
                  Telefono
                </label>
                <input
                  value={form.telefono}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, telefono: e.target.value }))
                  }
                  placeholder="03482-XXXXXX"
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                />
                <p className={`text-xs mt-1 ${textMuted}`}>
                  Solo se comparte cuando acordas con un cliente.
                </p>
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>
                  WhatsApp
                </label>
                <input
                  value={whatsappRaw}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                  placeholder="Ej: 3482 123456"
                  inputMode="numeric"
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                />
                {form.whatsapp.length >= 11 && (
                  <p
                    className={`text-xs mt-1.5 ${isDark ? "text-green-400" : "text-green-600"}`}
                  >
                    Listo: wa.me/{form.whatsapp}
                  </p>
                )}
                {whatsappRaw && form.whatsapp.length < 11 && (
                  <p
                    className={`text-xs mt-1.5 ${isDark ? "text-yellow-500" : "text-yellow-600"}`}
                  >
                    Numero incompleto.
                  </p>
                )}
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
            <h1 className={`text-xl font-bold mb-1 ${textPrimary}`}>
              Tipo de perfil
            </h1>
            <p className={`text-sm mb-4 ${textSec}`}>
              Elegí si ofrecés una profesión o un oficio, y después cargá hasta
              3 categorías.
            </p>

            <div className="flex gap-2 mb-5">
              <button
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    tipo: "profesion",
                    oficios: [],
                    oficioCustom: "",
                  }))
                }
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  form.tipo === "profesion" ? tagActive : tagInactive
                }`}
              >
                Profesión
              </button>
              <button
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    tipo: "oficio",
                    oficios: [],
                    oficioCustom: "",
                  }))
                }
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  form.tipo === "oficio" ? tagActive : tagInactive
                }`}
              >
                Oficio
              </button>
            </div>

            <p className={`text-sm mb-6 ${textSec}`}>
              Elegí hasta 3 {tipoLabelPlural}. Los clientes te van a encontrar
              por estas categorías.
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              {categoriasSugeridas.map((o) => (
                <button
                  key={o}
                  onClick={() => toggleOficio(o)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    form.oficios.includes(o) ? tagActive : tagInactive
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={form.oficioCustom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, oficioCustom: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && addCustomOficio()}
                placeholder={`Otra ${tipoLabel}...`}
                style={{ color: inputColor, backgroundColor: inputBg }}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${customInput}`}
              />
              <button
                onClick={addCustomOficio}
                className={`px-4 py-2.5 rounded-xl text-sm border transition-colors ${addBtn}`}
              >
                Agregar
              </button>
            </div>

            {form.oficios.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {form.oficios.map((o) => (
                  <span
                    key={o}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm ${selectedTag}`}
                  >
                    {o}
                    <button
                      onClick={() => toggleOficio(o)}
                      className="hover:opacity-70"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className={`flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-colors border ${btnSecondary}`}
              >
                Atras
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

        {/* Step 3 — Perfil */}
        {step === 3 && (
          <div>
            <h1 className={`text-xl font-bold mb-1 ${textPrimary}`}>
              Tu perfil
            </h1>
            <p className={`text-sm mb-6 ${textSec}`}>
              Contale a los clientes quien sos y que haces. Esto es lo primero
              que van a leer.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>
                  Descripcion{" "}
                  <span className={textMuted}>
                    ({form.descripcion.length}/500)
                  </span>
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      descripcion: e.target.value.slice(0, 500),
                    }))
                  }
                  placeholder="Conta que haces, como trabajas, en que zonas atendes. Cuanto mas claro, mejor."
                  rows={5}
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none ${inputCls}`}
                />
                {form.descripcion.length > 0 &&
                  form.descripcion.length < 30 && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Minimo 30 caracteres.
                    </p>
                  )}

                {/* Generar con IA */}
                {!aiOpen ? (
                  <button
                    type="button"
                    onClick={() => setAiOpen(true)}
                    className={`mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors ${
                      isDark
                        ? "border-purple-800 text-purple-400 hover:bg-purple-900/30"
                        : "border-purple-300 text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    <span>✦</span> Generar con IA
                  </button>
                ) : (
                  <div
                    className={`mt-3 p-3 rounded-xl border ${isDark ? "border-purple-800 bg-purple-950/30" : "border-purple-200 bg-purple-50"}`}
                  >
                    <p
                      className={`text-xs font-medium mb-2 ${isDark ? "text-purple-300" : "text-purple-700"}`}
                    >
                      Dos preguntas rapidas y la IA escribe el borrador
                    </p>
                    <div className="flex flex-col gap-2">
                      <input
                        value={aiForm.anios}
                        onChange={(e) =>
                          setAiForm((f) => ({ ...f, anios: e.target.value }))
                        }
                        placeholder="Años de experiencia (ej: 10)"
                        inputMode="numeric"
                        style={{ color: inputColor, backgroundColor: inputBg }}
                        className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                      />
                      <input
                        value={aiForm.zona}
                        onChange={(e) =>
                          setAiForm((f) => ({ ...f, zona: e.target.value }))
                        }
                        placeholder="Zonas donde trabajas (ej: Centro, Barrio Norte)"
                        style={{ color: inputColor, backgroundColor: inputBg }}
                        className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={handleGenerarDescripcion}
                        disabled={aiLoading}
                        className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
                      >
                        {aiLoading ? "Generando..." : "Generar descripcion"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiOpen(false)}
                        className={`px-3 py-2 rounded-xl text-xs border transition-colors ${btnSecondary}`}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>
                  Anos de experiencia y trabajos destacados{" "}
                  <span className={textMuted}>(opcional)</span>
                </label>
                <textarea
                  value={form.experiencia}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      experiencia: e.target.value.slice(0, 300),
                    }))
                  }
                  placeholder="Ej: 10 anos trabajando en Reconquista. Hice la instalacion electrica del Colegio X, el barrio Y..."
                  rows={3}
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none ${inputCls}`}
                />
              </div>
            </div>

            {error && (
              <p
                className={`mt-4 text-sm border rounded-xl px-4 py-3 ${errorCls}`}
              >
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(2)}
                className={`flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-colors border ${btnSecondary}`}
              >
                Atras
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

        {/* Step 4 — Notificaciones */}
        {step === 4 && (
          <Step4Notificaciones
            isDark={isDark}
            permission={permission}
            isSupported={isSupported}
            requestPermission={requestPermission}
            onFinish={() => router.push(`/profesional/${createdSlug}`)}
          />
        )}
      </div>
    </div>
  );
}
