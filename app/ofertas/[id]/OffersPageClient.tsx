"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, Instagram, X, Copy, Check, Download } from "lucide-react";
import { Supermarket, Offer } from "../../types";
import { deleteSupermarketOffer } from "../../utils/api";
import AddOfferModal from "../../components/AddOfferModal";
import EditOfferModal from "../../components/EditOfferModal";
import Navbar from "../../components/Navbar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ShareFormat = "story" | "feed";

interface ShareTarget {
  shareUrl: string;
  label: string;
}

function resolvePhoto(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}

async function downloadAndShare(imageUrl: string, filename: string) {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: blob.type || "image/png" });
  if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file] });
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function ShareModal({ target, onClose }: { target: ShareTarget; onClose: () => void }) {
  const [loading, setLoading] = useState<ShareFormat | null>(null);
  const [copied, setCopied] = useState(false);

  async function handle(format: ShareFormat) {
    setLoading(format);
    try {
      await downloadAndShare(`${target.shareUrl}&format=${format}`, `oferta-super-${format}.png`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 1300, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Compartir en Instagram</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">{target.label}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-600 mb-5">Elegí el formato para generar la imagen:</p>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handle("story")} disabled={!!loading} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-colors disabled:opacity-40">
            <div className="w-10 h-16 rounded-lg border-2 border-gray-600 bg-gray-800 flex items-center justify-center">
              {loading === "story" ? <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" /> : <Instagram className="w-4 h-4 text-gray-400" />}
            </div>
            <span className="text-xs font-semibold text-gray-300">Story</span>
            <span className="text-[10px] text-gray-600">1080 x 1920</span>
          </button>

          <button onClick={() => handle("feed")} disabled={!!loading} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-colors disabled:opacity-40">
            <div className="w-14 h-14 rounded-lg border-2 border-gray-600 bg-gray-800 flex items-center justify-center">
              {loading === "feed" ? <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" /> : <Instagram className="w-4 h-4 text-gray-400" />}
            </div>
            <span className="text-xs font-semibold text-gray-300">Feed</span>
            <span className="text-[10px] text-gray-600">1080 x 1080</span>
          </button>
        </div>

        <div className="mt-4 border-t border-gray-800 pt-4">
          <button onClick={copyLink} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-colors text-sm font-semibold text-gray-300">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "¡Link copiado!" : "Copiar link de la oferta"}
          </button>
        </div>

        <p className="text-[10px] text-gray-700 text-center mt-3 flex items-center justify-center gap-1">
          <Download className="w-3 h-3" />
          En desktop descarga la imagen. En mobile abre el selector del sistema.
        </p>
      </div>
    </div>
  );
}

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
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);

  const handleOfferAdded = (offer: Offer) => {
    setOffers((prev) => [offer, ...prev]);
    setIsAddOpen(false);
  };

  const handleOfferUpdated = (updated: Offer) => {
    setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setEditingOffer(null);
  };

  function openShare(offer: Offer) {
    const params = new URLSearchParams({
      titulo: offer.description,
      comercio: supermarket.name,
      ...(offer.price ? { precio: offer.price } : {}),
      ...(offer.photo ? { foto: resolvePhoto(offer.photo) } : {}),
      ...(supermarket.logo ? { logo: resolvePhoto(supermarket.logo) } : {}),
      ...(offer.validUntil ? { validaHasta: new Date(offer.validUntil).toLocaleDateString("es-AR") } : {}),
    });
    setShareTarget({
      shareUrl: `${window.location.origin}/share/offer?${params}`,
      label: offer.description,
    });
  }

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
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-20 pb-2">
        {/* Breadcrumb + store info */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => router.push("/ofertas")}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            {supermarket.logo ? (
              <img src={supermarket.logo} alt={supermarket.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-gray-400 dark:text-gray-500">
                {supermarket.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 dark:text-white truncate leading-none">{supermarket.name}</h1>
            {supermarket.address && (
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{supermarket.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* SEO: título visible para crawlers */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-2 pb-2">
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
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
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
                    onClick={() => openShare(offer)}
                    aria-label="Compartir en Instagram"
                    className="flex-1 flex items-center justify-center py-2.5 text-yellow-500 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
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

      {/* FAB — agregar oferta */}
      <button
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg flex items-center justify-center transition-colors"
        aria-label="Agregar oferta"
      >
        <Plus className="w-6 h-6" />
      </button>

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

      {shareTarget && (
        <ShareModal target={shareTarget} onClose={() => setShareTarget(null)} />
      )}
    </div>
  );
}
