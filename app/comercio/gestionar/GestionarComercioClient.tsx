"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import Navbar from "../../components/Navbar";
import type { Comercio, ComercioOffer, Producto } from "../../types";
import type { AnalyticsData, PlanInfo, Tab } from "../../lib/constants/storeConstants";
import {
  Store, ImageIcon, Tag, ShoppingBag, QrCode, BarChart2,
  ArrowLeft, ExternalLink, Megaphone,
} from "lucide-react";
import KitDigitalizacion from "./KitDigitalizacion";
import NuevoProductoWizard from "./NuevoProductoWizard";
import { StoreOfferModal } from "./components/StoreOfferModal";
import { StoreProductModal } from "./components/StoreProductModal";
import { StoreDataTab } from "./components/StoreDataTab";
import { StorePhotosTab } from "./components/StorePhotosTab";
import { StoreProductsTab } from "./components/StoreProductsTab";
import { StoreOffersTab } from "./components/StoreOffersTab";
import { StoreCommunityTab } from "./components/StoreCommunityTab";
import { StoreStatsTab } from "./components/StoreStatsTab";
import { StorePlanModal } from "./components/StorePlanModal";

import { API_URL } from "../../lib/api/client";

interface Props {
  comercio: Comercio & { offers?: ComercioOffer[]; productos?: Producto[] };
}

export default function GestionarComercioClient({ comercio: initial }: Props) {
  const router = useRouter();
  const { getToken } = useAuth();
  const { isDark } = useTheme();
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");
  const tabParam = searchParams.get("tab") as Tab | null;
  const activeSection = sectionParam || tabParam;
  const [tab] = useState<Tab>((searchParams.get("tab") as Tab) ?? "datos");

  const [comercio, setComercio] = useState(initial);
  const [offers, setOffers] = useState<ComercioOffer[]>(initial.offers ?? []);
  const [productos, setProductos] = useState<Producto[]>(initial.productos ?? []);

  const [showOfertaModal, setShowOfertaModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ComercioOffer | undefined>(undefined);
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | undefined>(undefined);
  const [showWizard, setShowWizard] = useState(false);

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Theme
  const bg      = isDark ? "bg-gray-950" : "bg-gray-50";
  const cardBg  = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted = isDark ? "text-gray-600" : "text-gray-400";

  useEffect(() => {
    async function fetchPlan() {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/comercios/me/plan`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (res.ok) setPlanInfo(await res.json());
      setPlanLoading(false);
    }
    fetchPlan();
  }, [getToken]);

  useEffect(() => {
    if ((tab !== "stats" && activeSection !== "stats") || analytics) return;
    setAnalyticsLoading(true);
    getToken()
      .then((token) => fetch(`${API_URL}/api/comercios/me/analytics`, { headers: { Authorization: `Bearer ${token}` } }))
      .then((r) => r.json())
      .then((d: AnalyticsData) => setAnalytics(d))
      .catch(() => { /**/ })
      .finally(() => setAnalyticsLoading(false));
  }, [tab, activeSection, analytics, getToken]);

  async function handleToggleOffer(offer: ComercioOffer) {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/comercios/me/offers/${offer.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !offer.activa }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch { /**/ }
  }

  async function handleDeleteOffer(offerId: string) {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/comercios/me/offers/${offerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
    } catch { /**/ }
  }

  async function handleToggleProducto(p: Producto) {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/comercios/me/productos/${p.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !p.activo }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setProductos((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch { /**/ }
  }

  async function handleDeleteProducto(id: string) {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/comercios/me/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch { /**/ }
  }

  const SECTION_TABS: { id: Tab; section: string; icon: React.ReactNode; title: string; badge: string }[] = [
    { id: "datos",    section: "datos",    icon: <Store className="w-6 h-6" />,      title: "Dados",          badge: "" },
    { id: "fotos",    section: "fotos",    icon: <ImageIcon className="w-6 h-6" />,  title: "Fotos",          badge: `${comercio.fotos?.length ?? 0} fotos` },
    { id: "productos", section: "productos", icon: <ShoppingBag className="w-6 h-6" />,title: "Catálogo",       badge: `${productos.length} items` },
    { id: "ofertas",  section: "ofertas",  icon: <Tag className="w-6 h-6" />,        title: "Ofertas",        badge: `${offers.length} ofertas` },
    { id: "comunidad",section: "comunidad",icon: <Megaphone className="w-6 h-6" />,  title: "Comunidad",      badge: "" },
    { id: "stats",    section: "stats",    icon: <BarChart2 className="w-6 h-6" />,  title: "Estadísticas",   badge: "" },
    { id: "kit",      section: "kit",      icon: <QrCode className="w-6 h-6" />,     title: "Mi Kit",         badge: "" },
  ];

  return (
    <div className={`min-h-screen ${bg} ${textPri} flex flex-col`}>
      <Navbar sidebarDisabled />

      {showOfertaModal && (
        <StoreOfferModal
          isDark={isDark}
          editing={editingOffer}
          onClose={() => { setShowOfertaModal(false); setEditingOffer(undefined); }}
          onSaved={(offer) => {
            setOffers((prev) =>
              editingOffer ? prev.map((o) => (o.id === offer.id ? offer : o)) : [offer, ...prev]
            );
            setShowOfertaModal(false);
            setEditingOffer(undefined);
          }}
        />
      )}

      {showProductoModal && (
        <StoreProductModal
          isDark={isDark}
          editing={editingProducto}
          onClose={() => { setShowProductoModal(false); setEditingProducto(undefined); }}
          onSaved={(p) => {
            setProductos((prev) =>
              editingProducto ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]
            );
            setShowProductoModal(false);
            setEditingProducto(undefined);
          }}
        />
      )}

      {showWizard && (
        <NuevoProductoWizard
          comercio={{ id: comercio.id, nombre: comercio.nombre, slug: comercio.slug, logo: comercio.logo, whatsapp: comercio.whatsapp }}
          getToken={getToken}
          onComplete={(prod) => {
            setProductos((prev) => [{ ...prod, tipo: "produto", activo: true, comercioId: comercio.id, createdAt: new Date().toISOString(), stock: null } as any, ...prev]);
            setShowWizard(false);
          }}
          onClose={() => setShowWizard(false)}
        />
      )}

      <div className="flex-1 max-w-xl mx-auto w-full px-4 pt-20 pb-40">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            {activeSection && (
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.search = "";
                  router.replace(url.pathname);
                }}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className={`text-xl font-black truncate ${textPri}`}>{comercio.nombre}</h1>
              <p className={`text-sm truncate ${textSec}`}>{comercio.rubro} · {comercio.barrio}</p>
            </div>
          </div>
          {!activeSection && (
            <button
              onClick={() => router.push(`/comercio/${comercio.slug}`)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver perfil
            </button>
          )}
        </div>

        {/* Plan banner */}
        {planLoading ? (
          <div className={`mb-6 h-20 rounded-2xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
        ) : planInfo?.plan === "master" ? (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl border border-amber-500/30 bg-amber-500/10">
            <span className="text-amber-400 text-lg">★</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-400">Plan Master</p>
              <p className={`text-xs ${textMuted}`}>Ilimitado · Soporte prioritario · Posición destacada</p>
            </div>
            <button onClick={() => setShowPlanModal(true)} className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-amber-500 text-amber-400 hover:bg-amber-500/20 transition-colors flex-shrink-0">
              Ver planes
            </button>
          </div>
        ) : planInfo?.plan === "premium" ? (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10">
            <span className="text-indigo-400 text-lg">✦</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-indigo-400">Plan Premium</p>
              <p className={`text-xs ${textMuted}`}>
                {planInfo.usage.productos}/{planInfo.limits.totalProducts} productos · {planInfo.limits.dailyAi}/día IA
              </p>
            </div>
            <button onClick={() => setShowPlanModal(true)} className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-500 text-indigo-400 hover:bg-indigo-500/20 transition-colors flex-shrink-0">
              Ver planes
            </button>
          </div>
        ) : (
          <div className={`mb-6 flex flex-col gap-2 px-4 py-3 rounded-2xl border ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center gap-3">
              <span className={`text-lg ${textMuted}`}>○</span>
              <div className="flex-1">
                <p className={`text-xs font-bold ${textPri}`}>Plan Gratuito</p>
                <p className={`text-xs ${textMuted}`}>
                  {planInfo?.usage.productos ?? 0}/{planInfo?.limits.totalProducts ?? 50} productos
                </p>
              </div>
              <button onClick={() => setShowPlanModal(true)} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex-shrink-0">
                Upgrade
              </button>
            </div>
            {planInfo?.canUpgrade && planInfo.usage.productos >= (planInfo.limits.totalProducts as number) - 3 && (
              <p className="text-xs text-amber-500">¡Casi alcanzás el límite! Considerá pasar a Premium.</p>
            )}
          </div>
        )}

        {/* Dashboard card grid */}
        {!activeSection && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SECTION_TABS.map((item) => (
                <button
                  key={item.section}
                  onClick={() => router.push(`?section=${item.section}`)}
                  className={`rounded-2xl border p-5 flex flex-col items-center justify-center gap-3 text-center transition-all hover:scale-[1.02] ${
                    isDark ? "bg-gray-900 border-gray-800 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className={`p-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className={`font-bold ${textPri}`}>{item.title}</p>
                    {item.badge && <p className={`text-xs mt-1 ${textMuted}`}>{item.badge}</p>}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Section views */}
        {activeSection === "datos" && (
          <StoreDataTab
            comercio={comercio}
            isDark={isDark}
            onComercioUpdate={(updated) => setComercio((prev) => ({ ...prev, ...updated }))}
          />
        )}

        {(activeSection === "fotos" || tab === "fotos") && (
          <StorePhotosTab
            comercio={comercio}
            isDark={isDark}
            onComercioUpdate={(updated) => setComercio((prev) => ({ ...prev, ...updated }))}
          />
        )}

        {(activeSection === "productos" || tab === "productos") && (
          <StoreProductsTab
            productos={productos}
            slug={comercio.slug}
            isPremium={!!(initial as any).isPremium}
            isDark={isDark}
            cardBg={cardBg}
            textPri={textPri}
            textSec={textSec}
            textMuted={textMuted}
            onAddClick={() => setShowWizard(true)}
            onEditClick={(p) => { setEditingProducto(p); setShowProductoModal(true); }}
            onToggle={handleToggleProducto}
            onDelete={handleDeleteProducto}
          />
        )}

        {(activeSection === "ofertas" || tab === "ofertas") && (
          <StoreOffersTab
            offers={offers}
            isDark={isDark}
            cardBg={cardBg}
            textPri={textPri}
            textSec={textSec}
            textMuted={textMuted}
            onAddClick={() => setShowOfertaModal(true)}
            onEditClick={(offer) => { setEditingOffer(offer); setShowOfertaModal(true); }}
            onToggle={handleToggleOffer}
            onDelete={handleDeleteOffer}
          />
        )}

        {(activeSection === "comunidad" || tab === "comunidad") && (
          <StoreCommunityTab
            comercio={{ id: comercio.id, nombre: comercio.nombre, slug: comercio.slug }}
            isDark={isDark}
            getToken={getToken}
          />
        )}

        {(activeSection === "stats" || tab === "stats") && (
          <StoreStatsTab
            analytics={analytics}
            analyticsLoading={analyticsLoading}
            isDark={isDark}
            cardBg={cardBg}
            textPri={textPri}
            textMuted={textMuted}
          />
        )}

        {(activeSection === "kit" || tab === "kit") && (
          <KitDigitalizacion
            comercio={comercio}
            isDark={isDark}
            cardBg={cardBg}
            textPri={textPri}
            textSec={textSec}
            textMuted={textMuted}
          />
        )}
      </div>

      {showPlanModal && planInfo && (
        <StorePlanModal
          isDark={isDark}
          currentPlan={planInfo.plan}
          planInfo={planInfo}
          onClose={() => setShowPlanModal(false)}
        />
      )}
    </div>
  );
}
