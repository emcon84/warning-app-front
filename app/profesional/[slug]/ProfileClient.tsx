"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { ProfessionalDetail, PublicReview } from "@/types";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/contexts/ThemeContext";
import { fireConfetti } from "./components/Stars";
import { LoginModal } from "./components/LoginModal";
import { ProfileSidebar } from "./components/ProfileSidebar";
import { ProfilePhotos } from "./components/ProfilePhotos";
import { ProfileReviews } from "./components/ProfileReviews";
import { ReviewForm } from "./components/ReviewForm";

import { API_URL } from "@/lib/api/client";
const SITE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://reportesreconquista.com";

interface Props {
  pro: ProfessionalDetail;
  slug: string;
}

export default function ProfileClient({ pro, slug }: Props) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { isDark } = useTheme();

  const [copied, setCopied] = useState(false);
  const [recommended, setRecommended] = useState(false);
  const [recCount, setRecCount] = useState(pro.recommendations || 0);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalContext, setLoginModalContext] = useState<"fav" | "review">("fav");
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formScore, setFormScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  const profileUrl = `${SITE_URL}/profesional/${pro.slug}`;

  // ── Theme variables ────────────────────────────────────────────
  const bg         = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSec    = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted  = isDark ? "text-gray-500" : "text-gray-400";
  const cardBg     = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const tagBg      = isDark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-100 border-gray-200 text-gray-600";
  const secBtn     = isDark ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700" : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200";

  // ── Effects ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSignedIn) return;
    getToken().then((token) => {
      if (!token) return;
      fetch(`${API_URL}/api/favorites`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((favs: { Professional: { slug: string } }[]) => {
          setIsFav(favs.some((f) => f.Professional?.slug === slug));
        })
        .catch(() => {});
    });
  }, [isSignedIn, slug]);

  useEffect(() => {
    fetch(`${API_URL}/api/professionals/${slug}/reviews`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setReviews(data); })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [slug]);

  useEffect(() => {
    if (typeof window !== "undefined")
      setRecommended(!!localStorage.getItem("rec_pro_" + pro.slug));
  }, [pro.slug]);

  // ── Handlers ───────────────────────────────────────────────────
  async function toggleFav() {
    if (!isSignedIn) { setLoginModalContext("fav"); setShowLoginModal(true); return; }
    setFavLoading(true);
    const wasAdding = !isFav;
    setIsFav(wasAdding);
    try {
      const token = await getToken();
      if (!token) { setIsFav(!wasAdding); return; }
      const headers: Record<string, string> = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      const res = wasAdding
        ? await fetch(`${API_URL}/api/favorites`, { method: "POST", headers, body: JSON.stringify({ professionalId: pro.id }) })
        : await fetch(`${API_URL}/api/favorites/${pro.id}`, { method: "DELETE", headers });
      if (!res.ok) setIsFav(!wasAdding);
    } catch {
      setIsFav(!wasAdding);
    } finally {
      setFavLoading(false);
    }
  }

  async function submitReview(score: number) {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const clerkToken = await getToken();
      const clientToken = typeof window !== "undefined" ? localStorage.getItem("clientToken") : null;
      const res = await fetch(`${API_URL}/api/professionals/${slug}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(clerkToken ? { Authorization: `Bearer ${clerkToken}` } : {}),
        },
        body: JSON.stringify({ score, clientToken: clientToken || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar opinión");
      }
      const newReview: PublicReview = await res.json();
      setReviews((prev) => [newReview, ...prev]);
      fireConfetti(score);
      setSubmitSuccess(true);
      setShowForm(false);
      setFormScore(0);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReport(reviewId: string) {
    if (!isSignedIn) { setLoginModalContext("review"); setShowLoginModal(true); return; }
    if (reportedIds.has(reviewId)) return;
    try {
      const clerkToken = await getToken();
      await fetch(`${API_URL}/api/professionals/${slug}/reviews/${reviewId}/report`, {
        method: "POST",
        headers: { ...(clerkToken ? { Authorization: `Bearer ${clerkToken}` } : {}) },
      });
      setReportedIds((prev) => new Set([...prev, reviewId]));
    } catch {}
  }

  function handleShare() {
    const text = `Mirá el perfil de ${pro.nombre} ${pro.apellido}, ${pro.oficios[0]} en Reconquista:\n${profileUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function handleRecommend() {
    if (recommended) return;
    try {
      const res = await fetch(API_URL + "/api/professionals/" + pro.slug + "/recommend", { method: "POST" });
      const data = await res.json();
      setRecommended(true);
      setRecCount(data.count ?? recCount + 1);
      localStorage.setItem("rec_pro_" + pro.slug, "1");
    } catch {}
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${bg} ${textPrimary} transition-colors`}>
      <Navbar totalReports={0} onMenuClick={() => {}} sidebarDisabled mapView="profesionales" />

      {showLoginModal && (
        <LoginModal
          context={loginModalContext}
          onClose={() => setShowLoginModal(false)}
          onSignUp={() => router.push("/sign-up")}
          onSignIn={() => router.push("/sign-in")}
          isDark={isDark}
        />
      )}

      {showForm && (
        <ReviewForm
          pro={pro}
          formScore={formScore}
          submitting={submitting}
          submitError={submitError}
          isDark={isDark}
          onScoreChange={(score) => {
            setFormScore(score);
            setTimeout(() => submitReview(score), 420);
          }}
          onCancel={() => { setShowForm(false); setSubmitError(""); setFormScore(0); }}
        />
      )}

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-16">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mt-16">
          {/* ── SIDEBAR ────────────────────────────────────────── */}
          <ProfileSidebar
            pro={pro}
            isFav={isFav}
            favLoading={favLoading}
            recommended={recommended}
            recCount={recCount}
            copied={copied}
            isDark={isDark}
            cardBg={cardBg}
            tagBg={tagBg}
            textPrimary={textPrimary}
            textSec={textSec}
            textMuted={textMuted}
            secBtn={secBtn}
            onWhatsapp={() => {
              const msg = `Hola ${pro.nombre}, te contacto desde Reportes Reconquista. `;
              window.open(`https://wa.me/${pro.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
            }}
            onChat={() => router.push(`/chat/nuevo?professionalId=${pro.id}`)}
            onRecommend={handleRecommend}
            onShare={handleShare}
            onToggleFav={toggleFav}
            onCopy={handleCopy}
          />

          {/* ── MAIN CONTENT ───────────────────────────────────── */}
          <main className="flex-1 min-w-0 space-y-6 mt-6 md:mt-0">
            {/* Description */}
            {pro.descripcion && (
              <div className={`p-5 md:p-6 rounded-2xl border ${cardBg}`}>
                <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${textSec}`}>
                  Sobre mí
                </h2>
                <p className={`leading-relaxed whitespace-pre-line ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {pro.descripcion}
                </p>
              </div>
            )}

            {/* Photos */}
            <ProfilePhotos fotos={pro.fotos ?? []} isDark={isDark} textSec={textSec} />

            {/* Reviews */}
            <ProfileReviews
              reviews={reviews}
              loading={loadingReviews}
              submitSuccess={submitSuccess}
              reportedIds={reportedIds}
              isSignedIn={!!isSignedIn}
              showForm={showForm}
              isDark={isDark}
              textSec={textSec}
              textMuted={textMuted}
              cardBg={cardBg}
              tagBg={tagBg}
              onShowForm={() => setShowForm(true)}
              onRequestLogin={() => { setLoginModalContext("review"); setShowLoginModal(true); }}
              onReport={handleReport}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
