"use client";

import { useState, useEffect } from "react";
import { Doctor, TurnoDisponibilidad } from "../types";
import { OBRAS_SOCIALES } from "../utils/doctorHelpers";
import { confirmarDoctor, getDoctor, getDisponibilidad, reportarDisponibilidad, updateDoctor, deleteDoctor } from "../utils/api";
import { X, Phone, MessageCircle, Stethoscope } from "lucide-react";
import { DoctorInfoTab } from "./doctor/DoctorInfoTab";
import { DoctorTurnosTab } from "./doctor/DoctorTurnosTab";
import { DoctorObrasTab } from "./doctor/DoctorObrasTab";

type Tab = "info" | "turnos" | "obras";

interface DoctorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
  onDoctorUpdate: (doctor: Doctor) => void;
  onRelocate?: (doctorId: string) => void;
  onDelete?: (doctorId: string) => void;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "info", label: "Info" },
  { key: "turnos", label: "Turnos" },
  { key: "obras", label: "Obras Sociales" },
];

export default function DoctorDetailModal({
  isOpen, onClose, doctor: initialDoctor, onDoctorUpdate, onRelocate, onDelete,
}: DoctorDetailModalProps) {
  const [doctor, setDoctor] = useState<Doctor>(initialDoctor);
  const [tab, setTab] = useState<Tab>("info");

  const [disponibilidades, setDisponibilidades] = useState<TurnoDisponibilidad[]>([]);
  const [showFormDisp, setShowFormDisp] = useState(false);
  const [savingDisp, setSavingDisp] = useState(false);
  const [formDisp, setFormDisp] = useState({ dias: [] as string[], horario: "", tipoTurno: "", obraSocial: "Todas", nota: "" });

  const [editingField, setEditingField] = useState<"direccion" | "telefono" | "whatsapp" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingField, setSavingField] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<{ lat: number; lng: number } | null>(null);

  const [confirming, setConfirming] = useState<string | null>(null);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [relocateAddress, setRelocateAddress] = useState("");
  const [relocateResult, setRelocateResult] = useState<{ lat: number; lng: number } | null>(null);
  const [relocating, setRelocating] = useState(false);
  const [savingRelocate, setSavingRelocate] = useState(false);
  const [relocateError, setRelocateError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDoctor(initialDoctor);
      setTab("info");
      setRelocateAddress("");
      setRelocateResult(null);
      setRelocateError(null);
      setConfirmDelete(false);
      getDisponibilidad(initialDoctor.id).then(setDisponibilidades).catch(() => {});
    }
  }, [isOpen, initialDoctor.id]);

  if (!isOpen) return null;

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

  const parseCoords = (input: string): { lat: number; lng: number } | null => {
    const match = input.trim().match(/^(-?\d{1,3}\.?\d*)\s*,\s*(-?\d{1,3}\.?\d*)$/);
    if (!match) return null;
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
  };

  const handleRelocateGeocode = async () => {
    if (!relocateAddress.trim()) return;
    setRelocateResult(null);
    setRelocateError(null);
    const coords = parseCoords(relocateAddress);
    if (coords) { setRelocateResult(coords); return; }
    setRelocating(true);
    try {
      const raw = relocateAddress.trim();
      const sepRegex = /\s+(?:y|e|-|\/|esq\.?|esquina)\s+/i;
      const parts = raw.split(sepRegex).map(s => s.trim()).filter(Boolean);
      const queries = [raw];
      if (parts.length === 2) {
        queries.push(`${parts[0]} & ${parts[1]}`);
        queries.push(`${parts[0]} at ${parts[1]}`);
        queries.push(parts[0]);
      }
      const bbox = "-59.85,-29.30,-59.45,-28.95";
      let found: { lat: number; lng: number } | null = null;
      for (const q of queries) {
        const encoded = encodeURIComponent(`${q}, Reconquista, Santa Fe, Argentina`);
        const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=ar&viewbox=${bbox}&bounded=1`;
        const res = await fetch(url, { headers: { "User-Agent": "warning-app/1.0" } });
        const data = await res.json();
        if (data.length > 0) { found = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }; break; }
        await new Promise(r => setTimeout(r, 300));
      }
      if (found) {
        setRelocateResult(found);
      } else {
        setRelocateError("No se encontró. Probá pegar coordenadas desde Google Maps o arrastrá el pin.");
      }
    } catch {
      setRelocateError("Error de conexión. Intentá de nuevo.");
    } finally {
      setRelocating(false);
    }
  };

  const handleSaveRelocate = async () => {
    if (!relocateResult) return;
    setSavingRelocate(true);
    try {
      const isCoords = !!parseCoords(relocateAddress);
      const updated = await updateDoctor(doctor.id, {
        lat: relocateResult.lat,
        lng: relocateResult.lng,
        ...(isCoords ? {} : { direccion: relocateAddress.trim() }),
      });
      setDoctor(updated);
      onDoctorUpdate(updated);
      setRelocateAddress("");
      setRelocateResult(null);
    } catch {
      alert("Error al guardar la ubicación.");
    } finally {
      setSavingRelocate(false);
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

  const getObrasSocialStatus = (os: string): "acepta" | "rechaza" | "desconocido" => {
    if (os === "IAPOS" && doctor.iapos) return "acepta";
    if (doctor.obrasSociales.includes(os)) return "acepta";
    const conf = (doctor.confirmaciones || []).filter((c) => c.obraSocial === os);
    if (conf.length > 0 && conf.some((c) => !c.acepta)) return "rechaza";
    return "desconocido";
  };

  const handleDeleteConfirmed = async () => {
    setDeleting(true);
    try {
      await deleteDoctor(doctor.id);
      onDelete!(doctor.id);
    } catch {
      alert("Error al eliminar.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b dark:border-gray-700 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base text-gray-900 dark:text-white truncate">{doctor.nombre}</h2>
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">{doctor.especialidad}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full flex-shrink-0">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Contact buttons */}
        {(doctor.telefono || doctor.whatsapp) && (
          <div className="flex gap-2 px-4 py-2 border-b dark:border-gray-700 flex-shrink-0">
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

        {/* Tabs nav */}
        <div className="flex border-b dark:border-gray-700 flex-shrink-0">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                tab === t.key
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto flex-1 p-4">
          {tab === "info" && (
            <DoctorInfoTab
              doctor={doctor}
              editingField={editingField}
              editValue={editValue}
              savingField={savingField}
              geocoding={geocoding}
              geocodeResult={geocodeResult}
              confirmDelete={confirmDelete}
              deleting={deleting}
              relocateAddress={relocateAddress}
              relocateResult={relocateResult}
              relocating={relocating}
              savingRelocate={savingRelocate}
              relocateError={relocateError}
              onRelocate={onRelocate}
              onDelete={onDelete}
              onStartEdit={startEdit}
              onCancelEdit={cancelEdit}
              onEditValueChange={(v) => { setEditValue(v); setGeocodeResult(null); }}
              onGeocode={handleGeocode}
              onSaveField={handleSaveField}
              onRelocateAddressChange={(v) => { setRelocateAddress(v); setRelocateResult(null); setRelocateError(null); }}
              onRelocateGeocode={handleRelocateGeocode}
              onSaveRelocate={handleSaveRelocate}
              onConfirmDelete={() => setConfirmDelete(true)}
              onCancelDelete={() => setConfirmDelete(false)}
              onDeleteConfirmed={handleDeleteConfirmed}
            />
          )}
          {tab === "turnos" && (
            <DoctorTurnosTab
              disponibilidades={disponibilidades}
              showFormDisp={showFormDisp}
              savingDisp={savingDisp}
              formDisp={formDisp}
              onShowForm={() => setShowFormDisp(true)}
              onHideForm={() => setShowFormDisp(false)}
              onToggleDia={toggleDia}
              onFormDispChange={(key, value) => setFormDisp((p) => ({ ...p, [key]: value }))}
              onSubmitDisp={handleSubmitDisp}
            />
          )}
          {tab === "obras" && (
            <DoctorObrasTab
              doctor={doctor}
              confirming={confirming}
              loadingConfirm={loadingConfirm}
              onConfirmar={handleConfirmar}
              onSetConfirming={setConfirming}
              getStatus={getObrasSocialStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
}
