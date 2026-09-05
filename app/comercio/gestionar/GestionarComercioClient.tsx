"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import type { Comercio, ComercioOffer, Producto } from "@/types";
import type { AnalyticsData, PlanInfo, Tab } from "@/lib/constants/storeConstants";
import {
  Store, ImageIcon, Tag, ShoppingBag, QrCode, BarChart2,
  ArrowLeft, ExternalLink, Megaphone, KeyRound, Eye, EyeOff, Loader2,
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

import { API_URL } from "@/lib/api/client";
import { STORE_CODE_KEY, buildStoreHeaders } from "./storeAuth";

interface Props {
  comercio?: Comercio;
}

export default function GestionarComercioClient({ comercio: initial }: Props) {
  const router = useRouter();
  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();
  const { isDark } = useTheme();
  const searchParams = useSearchParams();

  const initialSection = searchParams.get("section") || searchParams.get("tab") || null;
  const [activeSection, setActiveSection] = useState<string | null>(initialSection);

  function goToSection(section: string) {
    setActiveSection(section);
    window.history.pushState({}, "", `?section=${section}`);
  }

  function goToDashboard() {
    setActiveSection(null);
    window.history.pushState({}, "", window.location.pathname);
  }

  const [tab] = useState<Tab>((searchParams.get("tab") as Tab) ?? "datos");

  const [comercio, setComercio] = useState<Comercio | null>(initial ?? null);
  const [offers, setOffers] = useState<ComercioOffer[]>(initial?.offers ?? []);
  const [productos, setProductos] = useState<Producto[]>(initial?.productos ?? []);

  const [code, setCode] = useState<string | null>(null);
  const [clerkToken, setClerkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initial);

  const [waInput, setWaInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

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

  // Build auth headers: Clerk token when signed in, X-Store-Code otherwise.
  const buildHeaders = useCallback(
    () => buildStoreHeaders(code, clerkToken),
    [code, clerkToken],
  );

  // On mount: if signed in with Clerk, try to load the linked store directly.
  // Otherwise fall back to the WhatsApp+PIN flow (localStorage code).
  useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      let cancelled = false;
      (async () => {
        try {
          const token = await getToken();
          if (cancelled) return;
          setClerkToken(token);
          const res = await fetch(`${API_URL}/api/comercios/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data: Comercio = await res.json();
            if (cancelled) return;
            setComercio(data);
            setOffers(data.offers ?? []);
            setProductos(data.productos ?? []);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }
    const saved = localStorage.getItem(STORE_CODE_KEY);
    if (saved) {
      setCode(saved);
    } else {
      setLoading(false);
    }
  }, [isLoaded, user, getToken]);

  // When code is set, load the store
  useEffect(() => {
    if (!code) return;
    loadProfile(code);
  }, [code]);

  async function loadProfile(accessCode: string) {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/comercios/me`, {
        headers: { "X-Store-Code": accessCode },
      });
      if (!res.ok) {
        localStorage.removeItem(STORE_CODE_KEY);
        setCode(null);
        setLoading(false);
        return;
      }
      const data: Comercio = await res.json();
      setComercio(data);
      setOffers(data.offers ?? []);
      setProductos(data.productos ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    const wa = waInput.replace(/\D/g, "");
    const pin = pinInput.trim();
    if (!wa || !pin) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_URL}/api/comercios/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: wa, pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error ?? "Numero o PIN incorrecto.");
        return;
      }
      const { id } = await res.json();
      localStorage.setItem(STORE_CODE_KEY, id);
      setCode(id);
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    if (!code && !clerkToken) return;
    async function fetchPlan() {
      const res = await fetch(`${API_URL}/api/comercios/me/plan`, {
        headers: buildHeaders(),
      });
      if (res.ok) setPlanInfo(await res.json());
      setPlanLoading(false);
    }
    fetchPlan().catch(() => setPlanLoading(false));
  }, [buildHeaders, code, clerkToken]);

  useEffect(() => {
    if ((tab !== "stats" && activeSection !== "stats") || analytics) return;
    setAnalyticsLoading(true);
    fetch(`${API_URL}/api/comercios/me/analytics`, { headers: buildHeaders() })
      .then((r) => { if (!r.ok) { r.json().then(e => console.error("[analytics]", e)).catch(() => {}); return null; } return r.json(); })
      .then((d: AnalyticsData | null) => { if (d && !("error" in d)) setAnalytics(d); })
      .catch((e) => { console.error("[analytics fetch]", e); })
      .finally(() => setAnalyticsLoading(false));
  }, [tab, activeSection, analytics, buildHeaders]);

  async function handleToggleOffer(offer: ComercioOffer) {
    try {
      const res = await fetch(`${API_URL}/api/comercios/me/offers/${offer.id}`, {
        method: "PATCH",
        headers: { ...buildHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !offer.activa }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch { /**/ }
  }

  async function handleDeleteOffer(offerId: string) {
    try {
      await fetch(`${API_URL}/api/comercios/me/offers/${offerId}`, {
        method: "DELETE",
        headers: buildHeaders(),
      });
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
    } catch { /**/ }
  }

  async function handleToggleProducto(p: Producto) {
    try {
      const res = await fetch(`${API_URL}/api/comercios/me/productos/${p.id}`, {
        method: "PATCH",
        headers: { ...buildHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !p.activo }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setProductos((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch { /**/ }
  }

  async function handleDeleteProducto(id: string) {
    try {
      await fetch(`${API_URL}/api/comercios/me/productos/${id}`, {
        method: "DELETE",
        headers: buildHeaders(),
      });
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch { /**/ }
  }

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ─── Auth form ──────────────────────────────────────────────────────────────
  if (!comercio) {
    return (
      <div className={`min-h-screen ${bg} ${textPri}`}>
        <Navbar sidebarDisabled />
        <div className="max-w-sm mx-auto px-6 pt-28 pb-20 flex flex-col items-center gap-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? "bg-blue-500/20" : "bg-blue-50"}`}>
            <KeyRound className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-center">
            <h1 className={`text-xl font-bold mb-2 ${textPri}`}>Acceder a mi panel</h1>
            <p className={`text-sm ${textSec}`}>
              Ingresa tu WhatsApp y el PIN que elegiste al registrarte.
            </p>
          </div>

          <form onSubmit={handleAuth} className="w-full flex flex-col gap-3">
            <div>
              <label className={`text-xs mb-1.5 block ${textSec}`}>Numero de WhatsApp</label>
              <input
                value={waInput}
                onChange={(e) => { setWaInput(e.target.value); setAuthError(""); }}
                placeholder="3482 123456"
                inputMode="numeric"
                className={`w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none transition-colors ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-600" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
              />
            </div>
            <div>
              <label className={`text-xs mb-1.5 block ${textSec}`}>PIN de 4 digitos</label>
              <div className="relative">
                <input
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4)); setAuthError(""); }}
                  placeholder="••••"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={4}
                  className={`w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none transition-colors pr-12 text-center text-2xl tracking-[0.5em] font-bold ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-600" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                />
                <button type="button" onClick={() => setShowPin(v => !v)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {authError && <p className="text-red-400 text-xs text-center">{authError}</p>}
            <button
              type="submit"
              disabled={!waInput.trim() || pinInput.length < 4 || authLoading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {authLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</> : "Ingresar"}
            </button>
          </form>

          <p className={`text-xs text-center ${textMuted}`}>
            Una vez que ingresás, este dispositivo te va a recordar. No vas a tener que volver a ingresar.
          </p>
        </div>
      </div>
    );
  }

  const SECTION_TABS: { id: Tab; section: string; icon: React.ReactNode; title: string; badge: string }[] = [
    { id: "datos",    section: "datos",    icon: <Store className="w-6 h-6" />,      title: "Datos",          badge: "" },
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
          getHeaders={buildHeaders}
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
          getHeaders={buildHeaders}
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
          getHeaders={buildHeaders}
          onComplete={(prod) => {
            setProductos((prev) => [{ ...prod, tipo: "produto", activo: true, comercioId: comercio.id, createdAt: new Date().toISOString(), stock: null } as any, ...prev]);
            setShowWizard(false);
          }}
          onClose={() => setShowWizard(false)}
        />
      )}

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-24 pb-40">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            {activeSection && (
              <button
                onClick={goToDashboard}
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
        ) : (planInfo?.plan || comercio.plan) === "master" ? (
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
        ) : (planInfo?.plan || comercio.plan) === "premium" ? (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10">
            <span className="text-indigo-400 text-lg">✦</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-indigo-400">Plan Premium</p>
              <p className={`text-xs ${textMuted}`}>
                  {planInfo && planInfo.limits ? `${planInfo?.usage?.productos ?? 0}/${planInfo.limits.totalProducts} productos · ${planInfo.limits.dailyAi ?? 0}/día IA` : "Plan Premium"}
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
                    {planInfo && planInfo.limits ? `${planInfo?.usage?.productos ?? 0}/${planInfo.limits.totalProducts} productos` : "Gratuito"}
                  </p>
              </div>
              <button onClick={() => setShowPlanModal(true)} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex-shrink-0">
                Upgrade
              </button>
            </div>
            {planInfo?.canUpgrade && (
              <p className="text-xs text-amber-500">¡Casi alcanzás el límite! Considerá pasar a Premium.</p>
            )}
          </div>
        )}

        {/* Dashboard card grid */}
        {!activeSection && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <div             className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {SECTION_TABS.map((item) => (
                <button
                  key={item.section}
                  onClick={() => goToSection(item.section)}
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
            getHeaders={buildHeaders}
            onComercioUpdate={(updated) => setComercio((prev) => ({ ...(prev ?? comercio), ...updated }))}
          />
        )}

        {(activeSection === "fotos" || tab === "fotos") && (
          <StorePhotosTab
            comercio={comercio}
            isDark={isDark}
            getHeaders={buildHeaders}
            onComercioUpdate={(updated) => setComercio((prev) => ({ ...(prev ?? comercio), ...updated }))}
          />
        )}

        {(activeSection === "productos" || tab === "productos") && (
          <StoreProductsTab
            productos={productos}
            slug={comercio.slug}
            isPremium={!!comercio.isPremium}
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
            getHeaders={buildHeaders}
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
            comercio={comercio}
            getHeaders={buildHeaders}
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

      {showPlanModal && (
        <StorePlanModal
          isDark={isDark}
          currentPlan={planInfo?.plan ?? comercio.plan ?? "free"}
          planInfo={planInfo}
          onClose={() => setShowPlanModal(false)}
        />
      )}
    </div>
  );
}
