"use client";

import { useState, useEffect } from "react";
import { Doctor, TurnoDisponibilidad } from "../types";
import { OBRAS_SOCIALES } from "../utils/doctorHelpers";
import { confirmarDoctor, getDoctor, getDisponibilidad, reportarDisponibilidad, updateDoctor } from "../utils/api";
import { X, Phone, MessageCircle, MapPin, Stethoscope, CheckCircle, XCircle, HelpCircle, Calendar, Plus, Clock, Pencil } from "lucide-react";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const HORARIOS = ["Mañana", "Tarde", "Todo el día"]
const TIPOS_TURNO = ["Con turno previo", "Sin turno", "Por orden de llegada"]

interface DoctorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
  onDoctorUpdate: (doctor: Doctor) => void;
}

export default function DoctorDetailModal({
  isOpen,
  onClose,
  doctor: initialDoctor,
  onDoctorUpdate,
}: DoctorDetailModalProps) {
  const [doctor, setDoctor] = useState<Doctor>(initialDoctor);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [disponibilidades, setDisponibilidades] = useState<TurnoDisponibilidad[]>([]);
  const [showFormDisp, setShowFormDisp] = useState(false);
  const [savingDisp, setSavingDisp] = useState(false);
  const [formDisp, setFormDisp] = useState({
    dias: [] as string[],
    horario: "",
    tipoTurno: "",
    obraSocial: "Todas",
    nota: "",
  });

  useEffect(() => {
    if (isOpen) {
      getDisponibilidad(initialDoctor.id)
        .then(setDisponibilidades)
        .catch(() => {});
    }
  }, [isOpen, initialDoctor.id]);

  if (!isOpen) return null;

  const toggleDia = (dia: string) => {
    setFormDisp((prev) => ({
      ...prev,
      dias: prev.dias.includes(dia) ? prev.dias.filter((d) => d !== dia) : [...prev.dias, dia],
    }));
  };

  const handleSubmitDisp = async () => {
    if (!formDisp.dias.length || !formDisp.horario || !formDisp.tipoTurno) return;
    setSavingDisp(true);
    try {
      const nueva = await reportarDisponibilidad(doctor.id, formDisp);
      setDisponibilidades((prev) => [nueva, ...prev]);
      setShowFormDisp(false);
      setFormDisp({ dias: [], horario: "", tipoTurno: "", obraSocial: "Todas", nota: "" });
    } catch {
      alert("Error al guardar. Intentá de nuevo.");
    } finally {
      setSavingDisp(false);
    }
  };

  const [showEditForm, setShowEditForm] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    telefono: doctor.telefono || "",
    whatsapp: doctor.whatsapp || "",
    direccion: doctor.direccion || "",
  });

  const handleSubmitEdit = async () => {
    setSavingEdit(true);
    try {
      const payload: Record<string, string | null> = {};
      if (editForm.telefono.trim() !== (doctor.telefono || "")) payload.telefono = editForm.telefono.trim() || null;
      if (editForm.whatsapp.trim() !== (doctor.whatsapp || "")) payload.whatsapp = editForm.whatsapp.trim() || null;
      if (editForm.direccion.trim() !== (doctor.direccion || "")) payload.direccion = editForm.direccion.trim() || null;
      if (Object.keys(payload).length === 0) { setShowEditForm(false); return; }
      const updated = await updateDoctor(doctor.id, payload);
      setDoctor(updated);
      onDoctorUpdate(updated);
      setShowEditForm(false);
    } catch {
      alert("Error al guardar. Intentá de nuevo.");
    } finally {
      setSavingEdit(false);
    }
  };

  const formatDias = (dias: string[]) => dias.join(", ");
  const formatFecha = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000 / 60);
    if (diff < 60) return `hace ${diff} min`;
    if (diff < 1440) return `hace ${Math.floor(diff / 60)}h`;
    return `hace ${Math.floor(diff / 1440)}d`;
  };

  const handleConfirmar = async (obraSocial: string, acepta: boolean) => {
    setLoadingConfirm(true);
    try {
      const updated = await confirmarDoctor(doctor.id, obraSocial, acepta);
      // Recargar el doctor completo con confirmaciones
      const refreshed = await getDoctor(doctor.id);
      setDoctor(refreshed);
      onDoctorUpdate(refreshed);
      setConfirming(null);
    } catch (error) {
      console.error("Error al confirmar:", error);
      alert("Error al guardar confirmación");
    } finally {
      setLoadingConfirm(false);
    }
  };

  const getObrasSocialStatus = (obraSocial: string) => {
    if (doctor.obrasSociales.includes(obraSocial)) return "acepta";
    // Check if there's any history of rejection
    const confirmaciones = doctor.confirmaciones || [];
    const forThis = confirmaciones.filter((c) => c.obraSocial === obraSocial);
    if (forThis.length > 0 && forThis.some((c) => !c.acepta)) return "rechaza";
    return "desconocido";
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900 leading-tight">{doctor.nombre}</h2>
              <p className="text-sm text-green-700 font-medium">{doctor.especialidad}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Botones de contacto prominentes */}
          {(doctor.telefono || doctor.whatsapp) && (
            <div className="flex gap-2">
              {doctor.telefono && (
                <a
                  href={`tel:${doctor.telefono}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </a>
              )}
              {doctor.whatsapp && (
                <a
                  href={`https://wa.me/${doctor.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </div>
          )}

          {/* Completar información */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                <Pencil className="w-4 h-4 text-blue-500" />
                Información del consultorio
              </h3>
              <button
                onClick={() => { setShowEditForm((v) => !v); setEditForm({ telefono: doctor.telefono || "", whatsapp: doctor.whatsapp || "", direccion: doctor.direccion || "" }); }}
                className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700"
              >
                <Pencil className="w-3 h-3" />
                {showEditForm ? "Cancelar" : "Completar / corregir"}
              </button>
            </div>

            {!showEditForm ? (
              <div className="space-y-1.5 text-xs text-gray-600">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  {doctor.direccion || <span className="text-gray-400 italic">Dirección no cargada</span>}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  {doctor.telefono || <span className="text-gray-400 italic">Teléfono no cargado</span>}
                </p>
                <p className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  {doctor.whatsapp || <span className="text-gray-400 italic">WhatsApp no cargado</span>}
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" /> Dirección
                  </label>
                  <input
                    type="text"
                    value={editForm.direccion}
                    onChange={(e) => setEditForm((p) => ({ ...p, direccion: e.target.value }))}
                    placeholder="Ej: Belgrano 1234"
                    className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1">
                    <Phone className="w-3 h-3" /> Teléfono
                  </label>
                  <input
                    type="tel"
                    value={editForm.telefono}
                    onChange={(e) => setEditForm((p) => ({ ...p, telefono: e.target.value }))}
                    placeholder="Ej: 03482-123456"
                    className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1">
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm((p) => ({ ...p, whatsapp: e.target.value }))}
                    placeholder="Ej: 3482123456"
                    className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
                <button
                  onClick={handleSubmitEdit}
                  disabled={savingEdit}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-40"
                >
                  {savingEdit ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            )}
          </div>

          {/* Disponibilidad de turnos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-green-600" />
                Disponibilidad de turnos
              </h3>
              <button
                onClick={() => setShowFormDisp((v) => !v)}
                className="flex items-center gap-1 text-xs text-green-600 font-semibold hover:text-green-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Reportar
              </button>
            </div>

            {/* Formulario inline */}
            {showFormDisp && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 space-y-3">
                {/* Días */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">¿Qué días atiende?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {DIAS.map((dia) => (
                      <button
                        key={dia}
                        onClick={() => toggleDia(dia)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          formDisp.dias.includes(dia)
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-600 border border-gray-300"
                        }`}
                      >
                        {dia}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horario */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">Horario</p>
                  <div className="flex gap-1.5">
                    {HORARIOS.map((h) => (
                      <button
                        key={h}
                        onClick={() => setFormDisp((p) => ({ ...p, horario: h }))}
                        className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                          formDisp.horario === h
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-600 border border-gray-300"
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipo de turno */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">¿Cómo se atiende?</p>
                  <div className="flex flex-col gap-1.5">
                    {TIPOS_TURNO.map((t) => (
                      <button
                        key={t}
                        onClick={() => setFormDisp((p) => ({ ...p, tipoTurno: t }))}
                        className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          formDisp.tipoTurno === t
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-600 border border-gray-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Obra social */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">Obra social</p>
                  <select
                    value={formDisp.obraSocial}
                    onChange={(e) => setFormDisp((p) => ({ ...p, obraSocial: e.target.value }))}
                    className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-900" style={{color: "#111827"}}
                  >
                    <option value="Todas">Todas</option>
                    {OBRAS_SOCIALES.map((os) => (
                      <option key={os} value={os}>{os}</option>
                    ))}
                  </select>
                </div>

                {/* Nota opcional */}
                <input
                  type="text"
                  placeholder="Nota opcional (ej: solo por la mañana temprano)"
                  value={formDisp.nota}
                  onChange={(e) => setFormDisp((p) => ({ ...p, nota: e.target.value }))}
                  className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitDisp}
                    disabled={savingDisp || !formDisp.dias.length || !formDisp.horario || !formDisp.tipoTurno}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-40"
                  >
                    {savingDisp ? "Guardando..." : "Confirmar"}
                  </button>
                  <button
                    onClick={() => setShowFormDisp(false)}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Lista de disponibilidades */}
            {disponibilidades.length === 0 && !showFormDisp ? (
              <p className="text-xs text-gray-400 italic">Nadie reportó disponibilidad aún. ¡Sé el primero!</p>
            ) : (
              <div className="space-y-2">
                {disponibilidades.map((d) => (
                  <div key={d.id} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-800">{formatDias(d.dias)}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{d.horario}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                            {d.tipoTurno}
                          </span>
                          {d.obraSocial !== "Todas" && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                              {d.obraSocial}
                            </span>
                          )}
                        </div>
                        {d.nota && <p className="text-xs text-gray-500 mt-1 italic">"{d.nota}"</p>}
                      </div>
                      <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">{formatFecha(d.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Obras Sociales */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-2">Obras Sociales</h3>
            <div className="space-y-2">
              {OBRAS_SOCIALES.map((os) => {
                const status = getObrasSocialStatus(os);
                return (
                  <div key={os} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      {status === "acepta" && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {status === "rechaza" && <XCircle className="w-4 h-4 text-red-500" />}
                      {status === "desconocido" && <HelpCircle className="w-4 h-4 text-gray-400" />}
                      <span className="text-sm font-medium text-gray-800">{os}</span>
                      {status === "acepta" && <span className="text-xs text-green-600">Acepta</span>}
                      {status === "rechaza" && <span className="text-xs text-red-600">No acepta</span>}
                      {status === "desconocido" && <span className="text-xs text-gray-400">Sin info</span>}
                    </div>
                    {confirming === os ? (
                      <div className="flex gap-1">
                        <button
                          disabled={loadingConfirm}
                          onClick={() => handleConfirmar(os, true)}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          Sí
                        </button>
                        <button
                          disabled={loadingConfirm}
                          onClick={() => handleConfirmar(os, false)}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded font-semibold hover:bg-red-700 disabled:opacity-50"
                        >
                          No
                        </button>
                        <button
                          disabled={loadingConfirm}
                          onClick={() => setConfirming(null)}
                          className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded font-semibold hover:bg-gray-400 disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirming(os)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        ¿Sigue siendo así?
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
