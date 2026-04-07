"use client";

import { useState, useEffect } from "react";
import { Doctor, TurnoDisponibilidad } from "../types";
import { OBRAS_SOCIALES } from "../utils/doctorHelpers";
import { confirmarDoctor, getDoctor, getDisponibilidad, reportarDisponibilidad, updateDoctor } from "../utils/api";
import { X, Phone, MessageCircle, MapPin, Stethoscope, CheckCircle, XCircle, HelpCircle, Calendar, Plus, Clock, Pencil, Search, Trash2 } from "lucide-react";
import { deleteDoctor } from "../utils/api";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const HORARIOS = ["Mañana", "Tarde", "Todo el día"];
const TIPOS_TURNO = ["Con turno previo", "Sin turno", "Por orden de llegada"];
type Tab = "info" | "turnos" | "obras";

interface DoctorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
  onDoctorUpdate: (doctor: Doctor) => void;
  onRelocate?: (doctorId: string) => void;
  onDelete?: (doctorId: string) => void;
}

export default function DoctorDetailModal({
  isOpen,
  onClose,
  doctor: initialDoctor,
  onDoctorUpdate,
  onRelocate,
  onDelete,
}: DoctorDetailModalProps) {
  const [doctor, setDoctor] = useState<Doctor>(initialDoctor);
  const [tab, setTab] = useState<Tab>("info");

  // Disponibilidad
  const [disponibilidades, setDisponibilidades] = useState<TurnoDisponibilidad[]>([]);
  const [showFormDisp, setShowFormDisp] = useState(false);
  const [savingDisp, setSavingDisp] = useState(false);
  const [formDisp, setFormDisp] = useState({ dias: [] as string[], horario: "", tipoTurno: "", obraSocial: "Todas", nota: "" });

  // Info edit
  const [editingField, setEditingField] = useState<"direccion" | "telefono" | "whatsapp" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingField, setSavingField] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<{ lat: number; lng: number } | null>(null);

  // Obras sociales
  const [confirming, setConfirming] = useState<string | null>(null);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  // Delete
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDoctor(initialDoctor);
      setTab("info");
      getDisponibilidad(initialDoctor.id).then(setDisponibilidades).catch(() => {});
    }
  }, [isOpen, initialDoctor.id]);

  if (!isOpen) return null;

  // ─── Info handlers ───────────────────────────────────────────
  const startEdit = (field: "direccion" | "telefono" | "whatsapp") => {
    setEditingField(field);
    setEditValue(doctor[field] || "");
    setGeocodeResult(null);
  };

  const cancelEdit = () => { setEditingField(null); setGeocodeResult(null); };

  const handleGeocode = async () => {
    if (!editValue.trim()) return;
    setGeocoding(true);
    setGeocodeResult(null);
    try {
      const query = encodeURIComponent(`${editValue}, Reconquista, Santa Fe, Argentina`);
      const bbox = "-59.85,-29.30,-59.45,-28.95";
      const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ar&viewbox=${bbox}&bounded=1`;
      const res = await fetch(url, { headers: { "User-Agent": "warning-app/1.0" } });
      const data = await res.json();
      if (data.length > 0) {
        setGeocodeResult({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        alert("No se encontró la dirección en Reconquista. Podés usar el botón de arrastre en el mapa.");
      }
    } catch {
      alert("Error al buscar la dirección.");
    } finally {
      setGeocoding(false);
    }
  };

  const handleSaveField = async () => {
    setSavingField(true);
    try {
      const payload: Record<string, string | number | null> = {
        [editingField!]: editValue.trim() || null,
      };
      if (geocodeResult && editingField === "direccion") {
        payload.lat = geocodeResult.lat;
        payload.lng = geocodeResult.lng;
      }
      const updated = await updateDoctor(doctor.id, payload);
      setDoctor(updated);
      onDoctorUpdate(updated);
      setEditingField(null);
      setGeocodeResult(null);
    } catch {
      alert("Error al guardar.");
    } finally {
      setSavingField(false);
    }
  };

  // ─── Disponibilidad handlers ──────────────────────────────────
  const toggleDia = (dia: string) =>
    setFormDisp((p) => ({ ...p, dias: p.dias.includes(dia) ? p.dias.filter((d) => d !== dia) : [...p.dias, dia] }));

  const handleSubmitDisp = async () => {
    if (!formDisp.dias.length || !formDisp.horario || !formDisp.tipoTurno) return;
    setSavingDisp(true);
    try {
      const nueva = await reportarDisponibilidad(doctor.id, formDisp);
      setDisponibilidades((p) => [nueva, ...p]);
      setShowFormDisp(false);
      setFormDisp({ dias: [], horario: "", tipoTurno: "", obraSocial: "Todas", nota: "" });
    } catch { alert("Error al guardar."); }
    finally { setSavingDisp(false); }
  };

  // ─── Obras sociales handlers ──────────────────────────────────
  const handleConfirmar = async (obraSocial: string, acepta: boolean) => {
    setLoadingConfirm(true);
    try {
      await confirmarDoctor(doctor.id, obraSocial, acepta);
      const refreshed = await getDoctor(doctor.id);
      setDoctor(refreshed);
      onDoctorUpdate(refreshed);
      setConfirming(null);
    } catch { alert("Error al guardar confirmación."); }
    finally { setLoadingConfirm(false); }
  };

  const getObrasSocialStatus = (os: string) => {
    if (doctor.obrasSociales.includes(os)) return "acepta";
    const conf = (doctor.confirmaciones || []).filter((c) => c.obraSocial === os);
    if (conf.length > 0 && conf.some((c) => !c.acepta)) return "rechaza";
    return "desconocido";
  };

  const formatFecha = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 60) return `hace ${diff}m`;
    if (diff < 1440) return `hace ${Math.floor(diff / 60)}h`;
    return `hace ${Math.floor(diff / 1440)}d`;
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "info", label: "Info" },
    { key: "turnos", label: "Turnos" },
    { key: "obras", label: "Obras Sociales" },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base text-gray-900 truncate">{doctor.nombre}</h2>
            <p className="text-xs text-green-700 font-medium">{doctor.especialidad}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full flex-shrink-0">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Botones llamar — solo si tiene contacto */}
        {(doctor.telefono || doctor.whatsapp) && (
          <div className="flex gap-2 px-4 py-2 border-b flex-shrink-0">
            {doctor.telefono && (
              <a href={`tel:${doctor.telefono}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                <Phone className="w-4 h-4" /> Llamar
              </a>
            )}
            {doctor.whatsapp && (
              <a href={`https://wa.me/${doctor.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                tab === t.key
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto flex-1 p-4">

          {/* ── TAB INFO ── */}
          {tab === "info" && (
            <div className="space-y-3">
              {(["direccion", "telefono", "whatsapp"] as const).map((field) => {
                const icons = { direccion: MapPin, telefono: Phone, whatsapp: MessageCircle };
                const labels = { direccion: "Dirección", telefono: "Teléfono", whatsapp: "WhatsApp" };
                const Icon = icons[field];
                const isEditing = editingField === field;

                return (
                  <div key={field} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" /> {labels[field]}
                      </label>
                      {!isEditing && (
                        <button onClick={() => startEdit(field)}
                          className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                          <Pencil className="w-3 h-3" /> Editar
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex gap-1.5">
                          <input
                            type={field === "telefono" || field === "whatsapp" ? "tel" : "text"}
                            value={editValue}
                            onChange={(e) => { setEditValue(e.target.value); setGeocodeResult(null); }}
                            placeholder={field === "direccion" ? "Ej: Belgrano 1234" : field === "telefono" ? "Ej: 03482-123456" : "Ej: 3482123456"}
                            className="flex-1 text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
                            autoFocus
                          />
                          {field === "direccion" && (
                            <button onClick={handleGeocode} disabled={geocoding || !editValue.trim()}
                              title="Buscar en el mapa"
                              className="px-2.5 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 disabled:opacity-40 flex items-center gap-1">
                              <Search className="w-3.5 h-3.5" />
                              {geocoding ? "..." : "Buscar"}
                            </button>
                          )}
                        </div>
                        {geocodeResult && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Ubicación encontrada — se actualizará el pin al guardar
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button onClick={handleSaveField} disabled={savingField}
                            className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-40">
                            {savingField ? "Guardando..." : "Guardar"}
                          </button>
                          <button onClick={cancelEdit}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-800">
                        {doctor[field] || <span className="text-gray-400 italic text-xs">No cargado</span>}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Corregir ubicación con drag */}
              {onRelocate && (
                <button onClick={() => onRelocate(doctor.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-amber-300 text-amber-600 rounded-xl text-sm font-semibold hover:bg-amber-50">
                  <MapPin className="w-4 h-4" />
                  Corregir ubicación arrastrando el pin
                </button>
              )}

              {/* Eliminar médico */}
              {onDelete && (
                confirmDelete ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                    <p className="text-sm font-semibold text-red-700 text-center">¿Eliminar este médico del mapa?</p>
                    <p className="text-xs text-red-500 text-center">Esta acción no se puede deshacer.</p>
                    <div className="flex gap-2">
                      <button
                        disabled={deleting}
                        onClick={async () => {
                          setDeleting(true);
                          try {
                            await deleteDoctor(doctor.id);
                            onDelete(doctor.id);
                          } catch {
                            alert("Error al eliminar.");
                            setDeleting(false);
                            setConfirmDelete(false);
                          }
                        }}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-40">
                        {deleting ? "Eliminando..." : "Sí, eliminar"}
                      </button>
                      <button onClick={() => setConfirmDelete(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                    Eliminar este médico
                  </button>
                )
              )}
            </div>
          )}

          {/* ── TAB TURNOS ── */}
          {tab === "turnos" && (
            <div className="space-y-3">
              {!showFormDisp ? (
                <button onClick={() => setShowFormDisp(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-green-300 text-green-600 rounded-xl text-sm font-semibold hover:bg-green-50">
                  <Plus className="w-4 h-4" /> Reportar disponibilidad
                </button>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-3">
                  <p className="text-xs font-bold text-gray-700">¿Qué días atiende?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {DIAS.map((dia) => (
                      <button key={dia} onClick={() => toggleDia(dia)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          formDisp.dias.includes(dia) ? "bg-green-600 text-white" : "bg-white text-gray-600 border border-gray-300"
                        }`}>{dia}</button>
                    ))}
                  </div>

                  <p className="text-xs font-bold text-gray-700">Horario</p>
                  <div className="flex gap-1.5">
                    {HORARIOS.map((h) => (
                      <button key={h} onClick={() => setFormDisp((p) => ({ ...p, horario: h }))}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          formDisp.horario === h ? "bg-green-600 text-white" : "bg-white text-gray-600 border border-gray-300"
                        }`}>{h}</button>
                    ))}
                  </div>

                  <p className="text-xs font-bold text-gray-700">¿Cómo se atiende?</p>
                  <div className="flex flex-col gap-1.5">
                    {TIPOS_TURNO.map((t) => (
                      <button key={t} onClick={() => setFormDisp((p) => ({ ...p, tipoTurno: t }))}
                        className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                          formDisp.tipoTurno === t ? "bg-green-600 text-white" : "bg-white text-gray-600 border border-gray-300"
                        }`}>{t}</button>
                    ))}
                  </div>

                  <select value={formDisp.obraSocial}
                    onChange={(e) => setFormDisp((p) => ({ ...p, obraSocial: e.target.value }))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-2.5 py-2 bg-white">
                    <option value="Todas">Todas las obras sociales</option>
                    {OBRAS_SOCIALES.map((os) => <option key={os} value={os}>{os}</option>)}
                  </select>

                  <input type="text" placeholder="Nota opcional..."
                    value={formDisp.nota}
                    onChange={(e) => setFormDisp((p) => ({ ...p, nota: e.target.value }))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-2.5 py-2 bg-white" />

                  <div className="flex gap-2">
                    <button onClick={handleSubmitDisp}
                      disabled={savingDisp || !formDisp.dias.length || !formDisp.horario || !formDisp.tipoTurno}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold disabled:opacity-40">
                      {savingDisp ? "Guardando..." : "Confirmar"}
                    </button>
                    <button onClick={() => setShowFormDisp(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {disponibilidades.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">Nadie reportó disponibilidad aún. ¡Sé el primero!</p>
              ) : (
                <div className="space-y-2">
                  {disponibilidades.map((d) => (
                    <div key={d.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{d.dias.join(", ")}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{d.horario}</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{d.tipoTurno}</span>
                            {d.obraSocial !== "Todas" && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{d.obraSocial}</span>}
                          </div>
                          {d.nota && <p className="text-xs text-gray-500 mt-1 italic">"{d.nota}"</p>}
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{formatFecha(d.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB OBRAS SOCIALES ── */}
          {tab === "obras" && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-3">Confirmado por la comunidad. Ayudá actualizando la info.</p>
              {OBRAS_SOCIALES.map((os) => {
                const status = getObrasSocialStatus(os);
                return (
                  <div key={os} className={`flex items-center justify-between rounded-xl p-3 ${
                    status === "acepta" ? "bg-green-50 border border-green-200" :
                    status === "rechaza" ? "bg-red-50 border border-red-200" :
                    "bg-gray-50 border border-gray-200"
                  }`}>
                    <div className="flex items-center gap-2">
                      {status === "acepta" && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                      {status === "rechaza" && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      {status === "desconocido" && <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{os}</p>
                        <p className={`text-xs ${status === "acepta" ? "text-green-600" : status === "rechaza" ? "text-red-500" : "text-gray-400"}`}>
                          {status === "acepta" ? "Acepta" : status === "rechaza" ? "No acepta" : "Sin información"}
                        </p>
                      </div>
                    </div>
                    {confirming === os ? (
                      <div className="flex gap-1">
                        <button disabled={loadingConfirm} onClick={() => handleConfirmar(os, true)}
                          className="px-2.5 py-1 bg-green-600 text-white text-xs rounded-lg font-semibold disabled:opacity-50">Sí</button>
                        <button disabled={loadingConfirm} onClick={() => handleConfirmar(os, false)}
                          className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-lg font-semibold disabled:opacity-50">No</button>
                        <button disabled={loadingConfirm} onClick={() => setConfirming(null)}
                          className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-lg font-semibold">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirming(os)}
                        className="text-xs text-blue-500 hover:underline">
                        ¿Sigue así?
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
