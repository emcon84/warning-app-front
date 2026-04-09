"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Offer } from "../types";
import { updateOffer } from "../utils/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface EditOfferModalProps {
  offer: Offer | null;
  onClose: () => void;
  onOfferUpdated: (offer: Offer) => void;
}

export default function EditOfferModal({ offer, onClose, onOfferUpdated }: EditOfferModalProps) {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState<File | undefined>(undefined);
  const [validUntil, setValidUntil] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (offer) {
      setDescription(offer.description);
      setPrice(offer.price || "");
      setValidUntil(offer.validUntil ? offer.validUntil.slice(0, 10) : "");
      setPhoto(undefined);
      setError(null);
    }
  }, [offer]);

  if (!offer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await updateOffer(offer.id, {
        description: description.trim(),
        price: price.trim() || "",
        validUntil: validUntil || "",
        photo,
      });
      onOfferUpdated(updated);
    } catch {
      setError("Error al guardar. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="fixed inset-0 z-[1300] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Editar oferta</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">{error}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Descripción <span className="text-red-500">*</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Precio <span className="text-red-500">*</span></label>
            <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ej: $1.500 o 3x$2.000" className={inputClass} required />
          </div>

          {offer.photo && !photo && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Foto actual</label>
              <img
                src={offer.photo.startsWith("http") ? offer.photo : `${API_BASE_URL}${offer.photo}`}
                alt="Foto actual"
                className="w-full h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
              />
              <p className="text-xs text-gray-400 mt-1">Subí una nueva para reemplazarla</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{offer.photo ? "Reemplazar foto (opcional)" : "Foto (opcional)"}</label>
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0])} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-green-50 dark:file:bg-green-900/20 file:text-green-700 dark:file:text-green-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Válido hasta (opcional)</label>
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputClass} />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !description.trim() || !price.trim()} className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-xl transition-colors">
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
