import { MapPin, Phone, MessageCircle, Pencil, Search, CheckCircle, XCircle, Trash2 } from "lucide-react";
import type { Doctor } from "@/types";

interface Props {
  doctor: Doctor;
  editingField: "direccion" | "telefono" | "whatsapp" | null;
  editValue: string;
  savingField: boolean;
  geocoding: boolean;
  geocodeResult: { lat: number; lng: number } | null;
  confirmDelete: boolean;
  deleting: boolean;
  relocateAddress: string;
  relocateResult: { lat: number; lng: number } | null;
  relocating: boolean;
  savingRelocate: boolean;
  relocateError: string | null;
  onRelocate?: (doctorId: string) => void;
  onDelete?: (doctorId: string) => void;
  onStartEdit: (field: "direccion" | "telefono" | "whatsapp") => void;
  onCancelEdit: () => void;
  onEditValueChange: (v: string) => void;
  onGeocode: () => void;
  onSaveField: () => void;
  onRelocateAddressChange: (v: string) => void;
  onRelocateGeocode: () => void;
  onSaveRelocate: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onDeleteConfirmed: () => void;
}

const FIELD_ICONS = { direccion: MapPin, telefono: Phone, whatsapp: MessageCircle };
const FIELD_LABELS = { direccion: "Dirección", telefono: "Teléfono", whatsapp: "WhatsApp" };

export function DoctorInfoTab({
  doctor, editingField, editValue, savingField, geocoding, geocodeResult,
  confirmDelete, deleting, relocateAddress, relocateResult, relocating,
  savingRelocate, relocateError, onRelocate, onDelete,
  onStartEdit, onCancelEdit, onEditValueChange, onGeocode, onSaveField,
  onRelocateAddressChange, onRelocateGeocode, onSaveRelocate,
  onConfirmDelete, onCancelDelete, onDeleteConfirmed,
}: Props) {
  return (
    <div className="space-y-3">
      {(["direccion", "telefono", "whatsapp"] as const).map((field) => {
        const Icon = FIELD_ICONS[field];
        const isEditing = editingField === field;
        return (
          <div key={field} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" /> {FIELD_LABELS[field]}
              </label>
              {!isEditing && (
                <button onClick={() => onStartEdit(field)} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
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
                    onChange={(e) => { onEditValueChange(e.target.value); }}
                    placeholder={field === "direccion" ? "Ej: Belgrano 1234" : field === "telefono" ? "Ej: 03482-123456" : "Ej: 3482123456"}
                    className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800"
                    autoFocus
                  />
                  {field === "direccion" && (
                    <button onClick={onGeocode} disabled={geocoding || !editValue.trim()}
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
                  <button onClick={onSaveField} disabled={savingField}
                    className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-40">
                    {savingField ? "Guardando..." : "Guardar"}
                  </button>
                  <button onClick={onCancelEdit}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-800 dark:text-gray-100">
                {doctor[field] || <span className="text-gray-400 dark:text-gray-500 italic text-xs">No cargado</span>}
              </p>
            )}
          </div>
        );
      })}

      {/* Corregir ubicación */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 space-y-2">
        <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> Corregir ubicación del pin
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Dirección <span className="font-medium">o coordenadas</span> (-29.1234, -59.6789) desde Google Maps.
        </p>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={relocateAddress}
            onChange={(e) => { onRelocateAddressChange(e.target.value); }}
            placeholder="Ej: Belgrano 1234 o -29.1523, -59.6431"
            className="flex-1 text-sm border border-amber-300 dark:border-amber-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button
            onClick={onRelocateGeocode}
            disabled={relocating || !relocateAddress.trim()}
            className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 disabled:opacity-40 flex items-center gap-1">
            <Search className="w-3.5 h-3.5" />
            {relocating ? "..." : "Buscar"}
          </button>
        </div>
        {relocateError && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> {relocateError}
          </p>
        )}
        {relocateResult && (
          <div className="space-y-1.5">
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Dirección encontrada
            </p>
            <button onClick={onSaveRelocate} disabled={savingRelocate}
              className="w-full py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 disabled:opacity-40">
              {savingRelocate ? "Guardando..." : "Mover pin a esta dirección"}
            </button>
          </div>
        )}
        {onRelocate && (
          <button onClick={() => onRelocate(doctor.id)}
            className="w-full text-xs text-amber-700 dark:text-amber-400 hover:underline text-center pt-0.5">
            O arrastrá el pin manualmente en el mapa
          </button>
        )}
      </div>

      {/* Eliminar médico */}
      {onDelete && (
        confirmDelete ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
            <p className="text-sm font-semibold text-red-700 text-center">¿Eliminar este médico del mapa?</p>
            <p className="text-xs text-red-500 text-center">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button disabled={deleting} onClick={onDeleteConfirmed}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-40">
                {deleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button onClick={onCancelDelete}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button onClick={onConfirmDelete}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
            Eliminar este médico
          </button>
        )
      )}
    </div>
  );
}
