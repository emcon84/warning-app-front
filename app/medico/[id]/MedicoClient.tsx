"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Doctor } from "../../types";
import Navbar from "../../components/Navbar";
import { useTheme } from "../../contexts/ThemeContext";
import {
  MapPin, Phone, Stethoscope, MessageCircle,
  Navigation, CheckCircle, Loader, AlertTriangle,
  ChevronDown, ChevronUp, Search, X, Plus,
} from "lucide-react";

const MiniMap = dynamic(() => import("./MiniMap"), { ssr: false });

import { API_URL } from "../../lib/api/client";

const OBRAS_SOCIALES_SUGERIDAS = [
  "IAPOS", "OSDE", "Swiss Medical", "Galeno", "Medicus", "PAMI",
  "IOMA", "OSPAT", "OSFATUN", "Particular", "APROSS", "DOSEP",
];

interface Props { doctor: Doctor; }
type SaveState = "idle" | "saving" | "success" | "error";
type GeoState = "idle" | "loading" | "error";

export default function MedicoClient({ doctor: initial }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();
  const [doctor, setDoctor] = useState(initial);

  // Panel de edición
  const [editOpen, setEditOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  // Ubicación en edición
  const [editLat, setEditLat] = useState<number | null>(initial.lat ?? null);
  const [editLng, setEditLng] = useState<number | null>(initial.lng ?? null);
  const [addressSearch, setAddressSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [geoError, setGeoError] = useState("");

  // Obras sociales en edición
  const [editOS, setEditOS] = useState<string[]>(initial.obrasSociales ?? []);
  const [editIapos, setEditIapos] = useState(initial.iapos);
  const [newOS, setNewOS] = useState("");

  // Guardar
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");

  const isDirtyLocation = editLat !== (initial.lat ?? null) || editLng !== (initial.lng ?? null);
  const isDirtyOS =
    editIapos !== initial.iapos ||
    JSON.stringify([...editOS].sort()) !== JSON.stringify([...(initial.obrasSociales ?? [])].sort());
  const isDirty = isDirtyLocation || isDirtyOS;

  // Estilos
  const bg          = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSec     = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted   = isDark ? "text-gray-500" : "text-gray-400";
  const cardBg      = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const inputCls    = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-600"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  const waText = encodeURIComponent("Hola, te contacto desde Reportes Reconquista");
  const waUrl  = doctor.whatsapp ? `https://wa.me/${doctor.whatsapp}?text=${waText}` : null;

  // ── Geocoding con Nominatim ──────────────────────────────────────────────────
  async function handleSearchAddress() {
    if (!addressSearch.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    try {
      const q = encodeURIComponent(`${addressSearch.trim()}, Reconquista, Santa Fe, Argentina`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await res.json();
      if (!data.length) { setSearchError("No se encontro esa direccion. Proba con otra."); return; }
      setEditLat(parseFloat(data[0].lat));
      setEditLng(parseFloat(data[0].lon));
    } catch {
      setSearchError("Error al buscar la direccion. Verificá tu conexion.");
    } finally {
      setSearchLoading(false);
    }
  }

  // ── GPS ──────────────────────────────────────────────────────────────────────
  function handleGPS() {
    if (!navigator.geolocation) { setGeoError("Tu dispositivo no soporta geolocalización."); return; }
    setGeoState("loading");
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEditLat(pos.coords.latitude);
        setEditLng(pos.coords.longitude);
        setGeoState("idle");
      },
      (err) => {
        setGeoState("error");
        setGeoError(err.code === 1 ? "Permiso denegado. Habilitalo en la configuracion del dispositivo." : "No se pudo obtener tu ubicacion.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // ── Obras sociales ───────────────────────────────────────────────────────────
  function addOS(os: string) {
    const clean = os.trim();
    if (!clean || editOS.includes(clean)) return;
    setEditOS((prev) => [...prev, clean]);
    setNewOS("");
  }

  function removeOS(os: string) {
    setEditOS((prev) => prev.filter((o) => o !== os));
  }

  // ── Guardar ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaveState("saving");
    setSaveError("");
    try {
      const body: Record<string, any> = { obrasSociales: editOS, iapos: editIapos };
      if (editLat !== null && editLng !== null) { body.lat = editLat; body.lng = editLng; }
      const res = await fetch(`${API_URL}/api/doctors/${doctor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const updated: Doctor = await res.json();
      setDoctor(updated);
      setSaveState("success");
      setEditOpen(false);
      setTimeout(() => setSaveState("idle"), 3000);
    } catch {
      setSaveState("error");
      setSaveError("No se pudo guardar. Intentá de nuevo.");
    }
  }

  const hasSidebar = (doctor.obrasSociales?.length > 0 || !!doctor.iapos) || !!doctor.telefono || !!waUrl;

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <Navbar sidebarDisabled mapView="doctors" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-20 pb-32">

        {/* Volver */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-1.5 text-sm mb-5 transition-colors ${textSec}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Medicos
        </button>

        {/* Banner de aviso — full width */}
        <div className={`rounded-2xl border p-4 mb-6 ${
          isDark ? "bg-amber-900/20 border-amber-800/60" : "bg-amber-50 border-amber-200"
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${isDark ? "text-amber-300" : "text-amber-800"}`}>
                La informacion puede no estar actualizada
              </p>
              <p className={`text-xs mt-0.5 ${isDark ? "text-amber-400/80" : "text-amber-700"}`}>
                Si encontras datos incorrectos podés corregirlos vos mismo.
              </p>
              <button
                onClick={() => setTutorialOpen((v) => !v)}
                className={`text-xs mt-1.5 underline underline-offset-2 transition-colors ${
                  isDark ? "text-amber-400 hover:text-amber-300" : "text-amber-700 hover:text-amber-900"
                }`}
              >
                {tutorialOpen ? "Ocultar ayuda" : "Como corregir la informacion"}
              </button>
              {tutorialOpen && (
                <div className={`mt-3 text-xs space-y-1.5 leading-relaxed ${isDark ? "text-amber-400/80" : "text-amber-800"}`}>
                  <p>1. Hacé clic en <strong>Editar informacion</strong> para abrir el panel.</p>
                  <p>2. Para corregir la ubicacion tenes 3 opciones:</p>
                  <p className="pl-3">a) Escribi la direccion y presioná <strong>Buscar</strong>.</p>
                  <p className="pl-3">b) Hacé clic directo en el mapa o arrastrá el pin al lugar correcto.</p>
                  <p className="pl-3">c) Si estas fisicamente en el consultorio, usá <strong>Usar mi GPS</strong>.</p>
                  <p>3. Para obras sociales: agregá o quitá segun corresponda.</p>
                  <p>4. Cuando termines, presioná <strong>Guardar cambios</strong>.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Layout principal: 1 col mobile / 2 col desktop (solo si hay sidebar) */}
        <div className={`flex flex-col gap-4 ${hasSidebar ? "md:flex-row md:items-start md:gap-6" : ""}`}>

          {/* ── Columna izquierda (contenido principal) ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Card doctor */}
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  isDark ? "bg-blue-900/40 border border-blue-800" : "bg-blue-50 border border-blue-100"
                }`}>
                  <Stethoscope className={`w-7 h-7 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <div>
                  <h1 className={`text-xl font-black leading-tight ${textPrimary}`}>Dr/a. {doctor.nombre}</h1>
                  <p className={`text-sm font-semibold mt-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                    {doctor.especialidad}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                {doctor.direccion && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 flex-shrink-0 ${textMuted}`} />
                    <div>
                      <p className={`text-sm ${textPrimary}`}>{doctor.direccion}</p>
                      <p className={`text-xs ${textMuted}`}>{doctor.barrio}, Reconquista</p>
                    </div>
                  </div>
                )}
                {!doctor.direccion && doctor.barrio && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 flex-shrink-0 ${textMuted}`} />
                    <p className={`text-sm ${textSec}`}>{doctor.barrio}, Reconquista</p>
                  </div>
                )}
                {doctor.telefono && (
                  <div className="flex items-center gap-2.5">
                    <Phone className={`w-4 h-4 flex-shrink-0 ${textMuted}`} />
                    <p className={`text-sm ${textPrimary}`}>{doctor.telefono}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mapa — vista */}
            {doctor.lat && doctor.lng && !editOpen && (
              <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                <div className="px-4 pt-4 pb-2">
                  <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Ubicacion</p>
                </div>
                <div className="h-64 md:h-80">
                  <MiniMap lat={doctor.lat} lng={doctor.lng} nombre={doctor.nombre} isDark={isDark} />
                </div>
                {doctor.direccion && (
                  <div className={`px-4 py-3 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                    <p className={`text-xs ${textSec}`}>{doctor.direccion}, {doctor.barrio}</p>
                  </div>
                )}
              </div>
            )}

            {/* Éxito al guardar */}
            {saveState === "success" && (
              <div className={`rounded-2xl border p-3 flex items-center gap-2 ${
                isDark ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"
              }`}>
                <CheckCircle className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-green-400" : "text-green-600"}`} />
                <p className={`text-sm ${isDark ? "text-green-400" : "text-green-700"}`}>
                  Cambios guardados. Gracias por mejorar la informacion.
                </p>
              </div>
            )}

            {/* Panel Editar informacion */}
            <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
              <button
                onClick={() => setEditOpen((v) => !v)}
                className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${
                  isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                }`}
              >
                <span className={`text-sm font-semibold ${textPrimary}`}>Editar informacion</span>
                {editOpen ? <ChevronUp className={`w-4 h-4 ${textMuted}`} /> : <ChevronDown className={`w-4 h-4 ${textMuted}`} />}
              </button>

              {editOpen && (
                <div className={`border-t px-5 pb-5 pt-4 ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>Ubicacion</p>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={addressSearch}
                      onChange={(e) => setAddressSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchAddress()}
                      placeholder="Escribi la direccion del consultorio..."
                      className={`flex-1 px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                    />
                    <button
                      onClick={handleSearchAddress}
                      disabled={searchLoading || !addressSearch.trim()}
                      className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-50 ${
                        isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {searchLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </button>
                  </div>
                  {searchError && <p className="text-xs text-red-500 mb-3">{searchError}</p>}
                  <p className={`text-xs mb-2 ${textMuted}`}>
                    O hacé clic en el mapa / arrastrá el pin para ajustar la ubicacion exacta.
                  </p>
                  <div className={`h-56 rounded-xl overflow-hidden border mb-3 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                    <MiniMap
                      lat={editLat}
                      lng={editLng}
                      nombre={doctor.nombre}
                      isDark={isDark}
                      editable
                      onPositionChange={(lat, lng) => { setEditLat(lat); setEditLng(lng); }}
                    />
                  </div>
                  <button
                    onClick={handleGPS}
                    disabled={geoState === "loading"}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-60 mb-1 ${
                      isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {geoState === "loading" ? <Loader className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                    {geoState === "loading" ? "Obteniendo ubicacion..." : "Usar mi GPS"}
                  </button>
                  {geoError && <p className="text-xs text-red-500 mb-3">{geoError}</p>}
                  {editLat && editLng && (
                    <p className={`text-xs mb-4 ${isDark ? "text-green-400" : "text-green-600"}`}>
                      Pin en {editLat.toFixed(5)}, {editLng.toFixed(5)}
                    </p>
                  )}
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-3 mt-2 ${textMuted}`}>
                    Obras sociales y prepagas
                  </p>
                  <button
                    onClick={() => setEditIapos((v) => !v)}
                    className={`mb-3 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                      editIapos
                        ? isDark ? "bg-green-900/40 text-green-400 border-green-800" : "bg-green-50 text-green-700 border-green-300"
                        : isDark ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-gray-50 border-gray-300 text-gray-500"
                    }`}
                  >
                    IAPOS {editIapos ? "✓" : "+ agregar"}
                  </button>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editOS.map((os) => (
                      <span key={os} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${
                        isDark ? "bg-gray-800 text-gray-300 border-gray-700" : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}>
                        {os}
                        <button onClick={() => removeOS(os)} className="hover:text-red-400 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {OBRAS_SOCIALES_SUGERIDAS.filter((os) => !editOS.includes(os)).map((os) => (
                      <button
                        key={os}
                        onClick={() => addOS(os)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                          isDark ? "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300" : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600"
                        }`}
                      >
                        + {os}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newOS}
                      onChange={(e) => setNewOS(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { addOS(newOS); } }}
                      placeholder="Otra obra social..."
                      className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                    />
                    <button
                      onClick={() => addOS(newOS)}
                      disabled={!newOS.trim()}
                      className={`px-3 py-2 rounded-xl border text-sm transition-colors disabled:opacity-40 ${
                        isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {saveError && <p className="text-xs text-red-500 mb-2">{saveError}</p>}
                  <button
                    onClick={handleSave}
                    disabled={!isDirty || saveState === "saving"}
                    className="w-full py-3 rounded-2xl font-semibold text-sm transition-colors disabled:opacity-40 bg-blue-600 text-white hover:bg-blue-500"
                  >
                    {saveState === "saving" ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" /> Guardando...
                      </span>
                    ) : "Guardar cambios"}
                  </button>
                </div>
              )}
            </div>

          </div>{/* fin columna izquierda */}

          {/* ── Columna derecha (sidebar) — solo si tiene contenido ── */}
          {hasSidebar && <div className="flex flex-col gap-4 md:w-72 flex-shrink-0 mt-4 md:mt-0">

            {/* Obras sociales */}
            {(doctor.obrasSociales?.length > 0 || doctor.iapos) && (
              <div className={`rounded-2xl border p-5 ${cardBg}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
                  Obras sociales y prepagas
                </p>
                <div className="flex flex-wrap gap-2">
                  {doctor.iapos && (
                    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                      isDark ? "bg-green-900/40 text-green-400 border-green-800" : "bg-green-50 text-green-700 border-green-200"
                    }`}>IAPOS</span>
                  )}
                  {doctor.obrasSociales?.map((os) => (
                    <span key={os} className={`text-xs px-3 py-1 rounded-full border font-medium ${
                      isDark ? "bg-gray-800 text-gray-300 border-gray-700" : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>{os}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Contacto */}
            <div className="flex flex-col gap-2">
              {doctor.telefono && (
                <a
                  href={`tel:${doctor.telefono}`}
                  className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm transition-colors ${
                    isDark ? "bg-white text-gray-950 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </a>
              )}
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </div>

          </div>}{/* fin columna derecha */}

        </div>{/* fin layout 2 columnas */}

      </div>
    </div>
  );
}
