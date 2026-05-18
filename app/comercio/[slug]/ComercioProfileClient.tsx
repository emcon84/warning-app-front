"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { API_URL } from "@/lib/api/client";
import confetti from "canvas-confetti";
import { ShoppingCart } from "lucide-react";
import type { Comercio, ComercioPost } from "@/types";
import type { StoreReview } from "@/lib/api/stores";
import { getStoreReviews, getStorePosts, recommendStore, submitStoreReview, trackStoreEvent } from "@/lib/api/stores";
import { getRubroBadge, getRubroGradient } from "@/lib/constants/storeColors";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import { StoreLightbox } from "./components/StoreLightbox";
import { StoreHero } from "./components/StoreHero";
import { StoreInfoCard } from "./components/StoreInfoCard";
import { StoreReviewsSection } from "./components/StoreReviewsSection";
import { StoreGallery } from "./components/StoreGallery";
import { StoreCatalog } from "./components/StoreCatalog";
import { StoreCommunity } from "./components/StoreCommunity";
import { StoreOffers } from "./components/StoreOffers";
import { StoreReviewSheet } from "./components/StoreReviewSheet";

interface Props {
  comercio: Comercio;
  isOwner?: boolean;
}

function fireConfetti(score: number) {
  if (score >= 4) {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#FFD700", "#FFA500", "#10B981", "#3B82F6", "#F472B6"] });
    setTimeout(() => {
      confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#FFD700", "#FFA500", "#10B981"] });
      confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#FFD700", "#FFA500", "#10B981"] });
    }, 300);
  } else if (score <= 2) {
    confetti({ particleCount: 50, spread: 30, origin: { y: 0.2 }, colors: ["#6B7280", "#9CA3AF", "#60A5FA"], gravity: 0.5, ticks: 250, drift: 0 });
  }
}

export default function ComercioProfileClient({ comercio, isOwner }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();
  const { totalItems, openCart } = useCart();
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [isOwnerVerified, setIsOwnerVerified] = useState(isOwner ?? false);
  const checkedRef = useRef(false);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [recommended, setRecommended] = useState(false);
  const [recCount, setRecCount] = useState(comercio.recommendations ?? 0);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewScore, setReviewScore] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [posts, setPosts] = useState<ComercioPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const gallery = comercio.fotos?.length ? comercio.fotos : (comercio.foto ? [comercio.foto] : []);

  const theme = {
    isDark,
    bg:          isDark ? "bg-gray-950"                               : "bg-gray-50",
    textPrimary: isDark ? "text-white"                                : "text-gray-900",
    textSec:     isDark ? "text-gray-400"                             : "text-gray-500",
    textMuted:   isDark ? "text-gray-500"                             : "text-gray-400",
    cardBg:      isDark ? "bg-gray-900 border-gray-800"               : "bg-white border-gray-200",
    tagBg:       isDark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-100 border-gray-200 text-gray-600",
  };

  useEffect(() => {
    const key = `viewed_comercio_${comercio.slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    trackStoreEvent(comercio.slug, "profile_view");
  }, [comercio.slug]);

  useEffect(() => {
    setRecommended(!!localStorage.getItem(`rec_com_${comercio.slug}`));
  }, [comercio.slug]);

  useEffect(() => {
    if (!isLoaded || checkedRef.current) return;
    checkedRef.current = true;
    if (!isSignedIn) { setIsOwnerVerified(false); return; }
    getToken().then(token => {
      if (!token) return;
      return fetch(`${API_URL}/api/comercios/me`, { headers: { Authorization: `Bearer ${token}` } });
    }).then(res => {
      if (!res || !res.ok) return;
      return res.json();
    }).then(mine => {
      if (mine) setIsOwnerVerified(mine.slug === comercio.slug);
    }).catch(() => {});
  }, [isLoaded, isSignedIn, getToken, comercio.slug]);

  useEffect(() => {
    getStoreReviews(comercio.slug)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [comercio.slug]);

  useEffect(() => {
    setLoadingPosts(true);
    getStorePosts(comercio.slug, 10)
      .then(data => setPosts(data.posts ?? []))
      .catch(() => {})
      .finally(() => setLoadingPosts(false));
  }, [comercio.slug]);

  async function handleRecommend() {
    if (recommended) return;
    const data = await recommendStore(comercio.slug).catch(() => null);
    if (!data) return;
    setRecommended(true);
    setRecCount(data.count);
    localStorage.setItem(`rec_com_${comercio.slug}`, "1");
  }

  async function handleSubmitReview(score: number) {
    if (submittingReview) return;
    setSubmittingReview(true);
    setReviewError("");
    try {
      const token = await getToken();
      await submitStoreReview(comercio.slug, score, token ?? "");
      fireConfetti(score);
      setReviewSuccess(true);
      setShowReviewForm(false);
      setReviewScore(0);
      getStoreReviews(comercio.slug).then(setReviews).catch(() => {});
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : "Error al enviar. Intentá de nuevo.");
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textPrimary} flex flex-col`}>
      <Navbar sidebarDisabled />

      {lightboxIdx !== null && (
        <StoreLightbox
          photos={gallery}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx((lightboxIdx - 1 + gallery.length) % gallery.length)}
          onNext={() => setLightboxIdx((lightboxIdx + 1) % gallery.length)}
        />
      )}

      <div className="flex-1 max-w-xl md:max-w-3xl mx-auto w-full pb-40">
        <StoreHero
          comercio={comercio}
          heroGradient={getRubroGradient(comercio.rubro)}
          onBack={() => router.push("/comercios")}
        />

        <StoreInfoCard
          comercio={comercio}
          theme={theme}
          rubroBadge={getRubroBadge(comercio.rubro, isDark)}
          isOwner={isOwnerVerified}
          recommended={recommended}
          recCount={recCount}
          onRecommend={handleRecommend}
          onManage={() => router.push("/comercio/gestionar")}
        />

        <StoreReviewsSection
          comercio={comercio}
          theme={theme}
          reviews={reviews}
          loading={loadingReviews}
          reviewSuccess={reviewSuccess}
          isSignedIn={isSignedIn}
          onOpenForm={() => setShowReviewForm(true)}
          onSignIn={() => router.push("/sign-in")}
        />

        {gallery.length > 0 && (
          <StoreGallery
            photos={gallery}
            theme={theme}
            onPhotoClick={setLightboxIdx}
          />
        )}

        <StoreCatalog
          comercio={comercio}
          theme={theme}
          isOwner={isOwnerVerified}
          onManage={() => router.push("/comercio/gestionar?tab=productos")}
        />

        <StoreCommunity
          comercio={comercio}
          posts={posts}
          loading={loadingPosts}
          theme={theme}
          isOwner={isOwnerVerified}
          onPublish={() => router.push("/comercio/gestionar?tab=comunidad")}
        />

        <StoreOffers
          offers={comercio.offers ?? []}
          whatsapp={comercio.whatsapp}
          theme={theme}
          isOwner={isOwnerVerified}
          comercioNombre={comercio.nombre}
          comercioLogo={comercio.logo ?? undefined}
          comercioSlug={comercio.slug}
          onEdit={() => router.push("/comercio/gestionar?tab=ofertas")}
        />
      </div>

      {showReviewForm && (
        <StoreReviewSheet
          comercio={comercio}
          theme={theme}
          submitting={submittingReview}
          error={reviewError}
          score={reviewScore}
          onScore={(s) => { setReviewScore(s); setTimeout(() => handleSubmitReview(s), 420); }}
          onClose={() => { setShowReviewForm(false); setReviewError(""); setReviewScore(0); }}
        />
      )}

      {totalItems > 0 && (
        <button
          onClick={openCart}
          className="fixed bottom-20 right-4 z-[1500] w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-2xl flex items-center justify-center transition-all active:scale-95"
          aria-label="Ver carrito"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-950 text-amber-400 text-[10px] font-black flex items-center justify-center">
            {totalItems}
          </span>
        </button>
      )}
    </div>
  );
}
