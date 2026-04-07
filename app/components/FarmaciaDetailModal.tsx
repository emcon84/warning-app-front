"use client";

import { useState } from "react";
import { X, Phone, MapPin, XCircle, CheckCircle, Loader2, Move } from "lucide-react";
import { Farmacia } from "../types";
import { updateFarmacia } from "../utils/api";

interface FarmaciaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmacia: Farmacia;
  onFarmaciaUpdate: (f: Farmacia) => void;
  onStartDrag?: (farmaciaId: string) => void;
}

export default function FarmaciaDetailModal({ isOpen, onClose, farmacia: initial, onFarmaciaUpdate, onStartDrag }: FarmaciaDetailModalProps) {
  const [farmacia, setFarmacia] = useState<Farmacia>(initial);

  // Relocalización
  const [relocateAddress, setRelocateAddress] = useState("");
  const [relocateResult, setRelocateResult] = useState<{ lat: number; lng: number } | null>(null);
  const [relocateError, setRelocateError] = useState<string | null>(null);
  const [relocating, setRelocating] = useState(false);
  const [savingRelocate, setSavingRelocate] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setRelocateAddress("");
    setRelocateResult(null);
    setRelocateError(null);
    onClose();
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

    // Intentar parsear como coordenadas primero
    const coords = parseCoords(relocateAddress);
    if (coords) {
      setRelocateResult(coords);
      return;
    }

    setRelocating(true);
    try {
      const raw = relocateAddress.trim();
      const bbox = "-59.85,-29.30,-59.45,-28.95";

      // Normalizar separadores de intersección: "y", "-", "/", "esq.", "esquina"
      const sepRegex = /\s+(?:y|e|-|\/|esq\.?|esquina)\s+/i;
      const parts = raw.split(sepRegex).map(s => s.trim()).filter(Boolean);
      const isIntersection = parts.length === 2;

      // Armar lista de queries a probar en orden
      const queries: string[] = [raw];
      if (isIntersection) {
        queries.push(`${parts[0]} & ${parts[1]}`);       // formato Nominatim para intersecciones
        queries.push(`${parts[0]} at ${parts[1]}`);
        queries.push(parts[0]);                            // solo primera calle como fallback
      }

      const doGeocode = async (q: string) => {
        const encoded = encodeURIComponent(`${q}, Reconquista, Santa Fe, Argentina`);
        const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=ar&viewbox=${bbox}&bounded=1`;
        const res = await fetch(url, { headers: { "User-Agent": "warning-app/1.0" } });
        const data = await res.json();
        return data.length > 0 ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
      };

      let found: { lat: number; lng: number } | null = null;
      for (const q of queries) {
        found = await doGeocode(q);
        if (found) break;
        await new Promise(r => setTimeout(r, 300)); // respetar rate-limit Nominatim
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
      // Solo actualizar dirección si el input es texto (no coordenadas)
      const isCoords = !!parseCoords(relocateAddress);
      const updated = await updateFarmacia(farmacia.id, {
        lat: relocateResult.lat,
        lng: relocateResult.lng,
        ...(isCoords ? {} : { direccion: relocateAddress.trim() }),
      });
      const merged = { ...farmacia, ...updated };
      setFarmacia(merged);
      onFarmaciaUpdate(merged);
      setRelocateAddress("");
      setRelocateResult(null);
    } catch {
      setRelocateError("Error al guardar la ubicación.");
    } finally {
      setSavingRelocate(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 px-5 py-4 border-b ${farmacia.esDeturno ? "bg-green-50 border-green-200" : "bg-white border-gray-100"}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              {farmacia.esDeturno && (
                <span className="inline-block text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mb-1">
                  🟢 DE TURNO HOY
                </span>
              )}
              <h2 className="text-lg font-bold text-gray-900">Farmacia {farmacia.nombre}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{farmacia.direccion}</p>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Info básica */}
          {farmacia.telefono && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`tel:${farmacia.telefono}`} className="text-sm font-medium text-blue-600">
                {farmacia.telefono}
              </a>
            </div>
          )}

          {farmacia.esDeturno && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              <p className="font-semibold mb-1">Farmacia de turno</p>
              <p className="text-green-700 text-xs">Atiende de 8h a 8h del día siguiente. Solo recetas y medicamentos de emergencia.</p>
            </div>
          )}

          {/* Corrección de ubicación */}
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
            {/* Botón drag */}
            {onStartDrag && (
              <button
                onClick={() => { onStartDrag(farmacia.id); handleClose(); }}
                className="w-full mb-3 flex items-center justify-center gap-2 py-2 bg-white border border-amber-300 text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-50"
              >
                <Move className="w-4 h-4" />
                Arrastrar pin en el mapa
              </button>
            )}
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Corregir ubicación del pin</span>
            </div>
            <p className="text-xs text-amber-700 mb-1">
              Ingresá la dirección o pegá coordenadas desde Google Maps.
            </p>
            <p className="text-xs text-amber-600 mb-3">
              Para obtener coordenadas: abrí Google Maps, tocá el lugar exacto y copiá los números que aparecen abajo (ej: <strong>-29.1523, -59.6431</strong>).
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: -29.1523, -59.6431 o San Martín 1034"
                value={relocateAddress}
                onChange={e => { setRelocateAddress(e.target.value); setRelocateResult(null); setRelocateError(null); }}
                onKeyDown={e => e.key === "Enter" && handleRelocateGeocode()}
                className="flex-1 text-sm border border-amber-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                onClick={handleRelocateGeocode}
                disabled={relocating || !relocateAddress.trim()}
                className="px-3 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 flex-shrink-0 flex items-center gap-1"
              >
                {relocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Buscar"}
              </button>
            </div>

            {relocateError && (
              <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> {relocateError}
              </p>
            )}

            {relocateResult && (
              <div className="mt-3 p-3 bg-white border border-green-300 rounded-lg">
                <p className="text-xs text-green-700 font-medium flex items-center gap-1 mb-2">
                  <CheckCircle className="w-3.5 h-3.5" /> Dirección encontrada
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {relocateResult.lat.toFixed(5)}, {relocateResult.lng.toFixed(5)}
                </p>
                <button
                  onClick={handleSaveRelocate}
                  disabled={savingRelocate}
                  className="w-full py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {savingRelocate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Guardar nueva ubicación"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
