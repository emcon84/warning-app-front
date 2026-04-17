"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Supermarket, Offer } from "../types";
import { getOffers, deleteSupermarketOffer } from "../utils/api";
import AddOfferModal from "./AddOfferModal";
import EditOfferModal from "./EditOfferModal";
import { useTheme } from "../contexts/ThemeContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface SupermarketOffersModalProps {
  supermarket: Supermarket | null;
  onClose: () => void;
}

export default function SupermarketOffersModal({ supermarket, onClose }: SupermarketOffersModalProps) {
  const { isDark } = useTheme();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Offer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supermarket) return;
    setLoading(true);
    setOffers([]);
    getOffers(supermarket.id)
      .then(setOffers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [supermarket]);

  if (!supermarket) return null;

  const handleOfferAdded = (offer: Offer) => {
    setOffers((prev) => [offer, ...prev]);
    setIsAddOpen(false);
  };

  const handleOfferUpdated = (updated: Offer) => {
    setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setEditingOffer(null);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    setConfirmDelete(null);
    try {
      await deleteSupermarketOffer(confirmDelete.id);
      setOffers((prev) => prev.filter((o) => o.id !== confirmDelete.id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";

  return (
    <>
      <div className="fixed inset-0 z-[1100] flex flex-col" style={{ top: 52, backgroundColor: isDark ? '#030712' : '#f9fafb' }}>
        {/* Header */}
        <div className={`flex-shrink-0 flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`} style={{ backgroundColor: isDark ? '#111827' : '#ffffff' }}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
              {supermarket.logo ? (
                <img src={supermarket.logo} alt={supermarket.name} className="w-full h-full object-cover" />
              ) : (
                <span className={`text-base font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  {supermarket.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{supermarket.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar oferta
            </button>
            <button
              onClick={onClose}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors text-sm font-medium ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </div>
        </div>

        {/* Grid de ofertas */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
            </div>
          ) : offers.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-40 gap-2 text-center px-6 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
              <p className="text-sm font-medium">No hay ofertas cargadas.</p>
              <p className="text-xs">Se el primero en agregar una!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className={`relative rounded-2xl overflow-hidden shadow-sm flex flex-col border ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
                >
                  {/* Foto */}
                  {offer.photo ? (
                    <img
                      src={offer.photo.startsWith("http") ? offer.photo : `${API_BASE_URL}${offer.photo}`}
                      alt={offer.description}
                      className="w-full h-32 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className={`w-full h-24 flex items-center justify-center flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                      <span className="text-2xl">🛒</span>
                    </div>
                  )}

                  {/* Contenido */}
                  <div className="p-2.5 flex-1 flex flex-col gap-1.5">
                    {offer.price && (
                      <div className="bg-green-500 rounded-lg px-2.5 py-1.5 text-center">
                        <p className="text-white font-extrabold text-base leading-none tracking-tight">{offer.price}</p>
                      </div>
                    )}
                    <p className={`text-xs font-medium leading-snug line-clamp-3 ${isDark ? "text-white" : "text-gray-900"}`}>{offer.description}</p>
                    {offer.validUntil && (
                      <p className={`text-[10px] mt-auto ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        Hasta: {new Date(offer.validUntil).toLocaleDateString("es-AR")}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className={`flex border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                    <button
                      onClick={() => setEditingOffer(offer)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${isDark ? "text-blue-400 hover:bg-blue-900/20" : "text-blue-600 hover:bg-blue-50"}`}
                    >
                      <Pencil className="w-3 h-3" />
                      Editar
                    </button>
                    <div className={`w-px ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
                    <button
                      onClick={() => setConfirmDelete(offer)}
                      disabled={deletingId === offer.id}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors disabled:opacity-50 ${isDark ? "text-red-400 hover:bg-red-900/20" : "text-red-500 hover:bg-red-50"}`}
                    >
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal confirmar eliminación */}
      {confirmDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 1300, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setConfirmDelete(null)}
        >
          <div className={`rounded-2xl shadow-2xl w-full max-w-sm p-6 ${isDark ? "bg-gray-900" : "bg-white"}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${isDark ? "bg-red-900/30" : "bg-red-100"}`}>
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className={`text-base font-bold text-center mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Eliminar oferta</h3>
            <p className={`text-sm text-center mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Eliminás <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>"{confirmDelete.description}"</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm ${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"}`}>
                Cancelar
              </button>
              <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <AddOfferModal
        supermarketId={supermarket.id}
        supermarketName={supermarket.name}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onOfferAdded={handleOfferAdded}
      />

      <EditOfferModal
        offer={editingOffer}
        onClose={() => setEditingOffer(null)}
        onOfferUpdated={handleOfferUpdated}
      />
    </>
  );
}
