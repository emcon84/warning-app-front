"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, Share2 } from "lucide-react";
import { Supermarket, Offer } from "../../types";
import { deleteSupermarketOffer } from "../../utils/api";
import AddOfferModal from "../../components/AddOfferModal";
import EditOfferModal from "../../components/EditOfferModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Props {
  supermarket: Supermarket;
  initialOffers: Offer[];
}

export default function OffersPageClient({ supermarket, initialOffers }: Props) {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Offer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOfferAdded = (offer: Offer) => {
    setOffers((prev) => [offer, ...prev]);
    setIsAddOpen(false);
  };

  const handleOfferUpdated = (updated: Offer) => {
    setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setEditingOffer(null);
  };

  const handleShare = (offer: Offer) => {
    const url = `${window.location.origin}/ofertas/${supermarket.id}#offer-${offer.id}`;
    const text = `🛒 ${offer.description}${offer.price ? ` — $${offer.price}` : ""} en ${supermarket.name}, Reconquista`;
    if (navigator.share) {
      navigator.share({ title: offer.description, text, url }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank");
    }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/ofertas")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              {supermarket.logo ? (
                <img src={supermarket.logo} alt={supermarket.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500">
                  {supermarket.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none">{supermarket.name}</h1>
              {supermarket.address && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{supermarket.address}</p>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Agregar oferta</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      {/* SEO: título visible para crawlers */}
      <div className="max-w-6xl mx-auto px-4 pt-5 pb-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Ofertas vigentes
          <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
            {offers.length} {offers.length === 1 ? "oferta" : "ofertas"}
          </span>
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Reconquista, Santa Fe · Actualizadas por la comunidad
        </p>
      </div>

      {/* Grid de ofertas */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        {offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400 dark:text-gray-600 text-center">
            <p className="text-4xl">😔</p>
            <p className="text-sm font-medium">No hay ofertas cargadas.</p>
            <p className="text-xs">¡Se el primero en agregar una!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {offers.map((offer) => (
              <div
                key={offer.id}
                id={`offer-${offer.id}`}
                className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm flex flex-col scroll-mt-20"
              >
                {offer.photo ? (
                  <img
                    src={offer.photo.startsWith("http") ? offer.photo : `${API_BASE_URL}${offer.photo}`}
                    alt={offer.description}
                    className="w-full h-32 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🛒</span>
                  </div>
                )}

                <div className="p-2.5 flex-1 flex flex-col gap-1.5">
                  {offer.price && (
                    <p className="text-green-500 dark:text-green-400 font-black text-xl leading-none tracking-tight">{offer.price}</p>
                  )}
                  <p className="text-xs font-medium text-gray-900 dark:text-white leading-snug line-clamp-3">{offer.description}</p>
                  {offer.validUntil && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-auto">
                      Hasta: {new Date(offer.validUntil).toLocaleDateString("es-AR")}
                    </p>
                  )}
                </div>

                <div className="flex border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleShare(offer)}
                    aria-label="Compartir"
                    className="flex-1 flex items-center justify-center py-2.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px bg-gray-100 dark:bg-gray-800" />
                  <button
                    onClick={() => setEditingOffer(offer)}
                    aria-label="Editar"
                    className="flex-1 flex items-center justify-center py-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px bg-gray-100 dark:bg-gray-800" />
                  <button
                    onClick={() => setConfirmDelete(offer)}
                    disabled={deletingId === offer.id}
                    aria-label="Eliminar"
                    className="flex-1 flex items-center justify-center py-2.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* JSON-LD para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: supermarket.name,
            address: {
              "@type": "PostalAddress",
              streetAddress: supermarket.address,
              addressLocality: "Reconquista",
              addressRegion: "Santa Fe",
              addressCountry: "AR",
            },
            ...(supermarket.lat && supermarket.lng
              ? { geo: { "@type": "GeoCoordinates", latitude: supermarket.lat, longitude: supermarket.lng } }
              : {}),
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: `Ofertas de ${supermarket.name}`,
              numberOfItems: offers.length,
              itemListElement: offers.slice(0, 10).map((o, i) => ({
                "@type": "Offer",
                position: i + 1,
                name: o.description,
                price: o.price ?? undefined,
                priceCurrency: "ARS",
                availability: "https://schema.org/InStock",
                ...(o.validUntil ? { priceValidUntil: o.validUntil } : {}),
              })),
            },
          }),
        }}
      />

      {/* Modal confirmar eliminación */}
      {confirmDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 1300, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setConfirmDelete(null)}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white text-center mb-1">Eliminar oferta</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              ¿Eliminás <span className="font-semibold text-gray-900 dark:text-white">"{confirmDelete.description}"</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold text-sm">
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
    </div>
  );
}
