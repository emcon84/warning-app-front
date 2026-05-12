"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { ProfessionalDetail, PublicReview } from "../../types";
import Navbar from "../../components/Navbar";
import { useTheme } from "../../contexts/ThemeContext";
import { fireConfetti } from "./components/Stars";
import { LoginModal } from "./components/LoginModal";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfilePhotos } from "./components/ProfilePhotos";
import { ProfileReviews } from "./components/ProfileReviews";
import { ReviewForm } from "./components/ReviewForm";
import { ProfileActions } from "./components/ProfileActions";

import { API_URL } from "../../lib/api/client";
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

  const bg         = isDark ? "bg-gray-950"                                 : "bg-gray-50";
  const textPrimary = isDark ? "text-white"                                  : "text-gray-900";
  const textSec    = isDark ? "text-gray-400"                               : "text-gray-500";
  const textMuted  = isDark ? "text-gray-500"                               : "text-gray-400";
  const cardBg     = isDark ? "bg-gray-900 border-gray-800"                 : "bg-white border-gray-200";
  const tagBg      = isDark ? "bg-gray-800 border-gray-700 text-gray-300"   : "bg-gray-100 border-gray-200 text-gray-600";
  const bottomBar  = isDark ? `${bg} border-gray-900`                       : "bg-white border-gray-200";
  const secBtn     = isDark ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700" : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200";

  useEffect(() => {
    if (!isSignedIn) return;
    getToken().then((token) => {
      if (!token) return;
      fetch(`/api/favorites`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((favs: { Professional: { slug: string } }[]) => {
          setIsFav(favs.some((f) => f.Professional?.slug === slug));
        })
        .catch(() => {});
    });
  }, [isSignedIn, slug]);

  useEffect(() => {
    fetch(`/api/professionals/${slug}/reviews`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setReviews(data); })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [slug]);

  useEffect(() => {
    if (typeof window !== "undefined")
      setRecommended(!!localStorage.getItem("rec_pro_" + pro.slug));
  }, [pro.slug]);

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
        ? await fetch(`/api/favorites`, { method: "POST", headers, body: JSON.stringify({ professionalId: pro.id }) })
        : await fetch(`/api/favorites/${pro.id}`, { method: "DELETE", headers });
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
      const res = await fetch(`/api/professionals/${slug}/reviews`, {
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
      await fetch(`/api/professionals/${slug}/reviews/${reviewId}/report`, {
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
      const res = await fetch(API + "/api/professionals/" + pro.slug + "/recommend", { method: "POST" });
      const data = await res.json();
      setRecommended(true);
      setRecCount(data.count ?? recCount + 1);
      localStorage.setItem("rec_pro_" + pro.slug, "1");
    } catch {}
  }

  return (
    <div className={`h-screen ${bg} ${textPrimary} flex flex-col overflow-hidden transition-colors`}>
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

      <div className="flex flex-col flex-1 overflow-hidden max-w-xl md:max-w-3xl mx-auto w-full pb-16">
        <ProfileHeader
          pro={pro}
          isDark={isDark}
          textPrimary={textPrimary}
          textSec={textSec}
          textMuted={textMuted}
          tagBg={tagBg}
          onBack={() => router.back()}
        />

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {pro.descripcion && (
            <div className={`mb-4 p-4 rounded-2xl border ${cardBg}`}>
              <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{pro.descripcion}</p>
            </div>
          )}

          <ProfilePhotos fotos={pro.fotos ?? []} isDark={isDark} textSec={textSec} />

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
        </div>

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

        <ProfileActions
          pro={pro}
          isFav={isFav}
          favLoading={favLoading}
          recommended={recommended}
          recCount={recCount}
          copied={copied}
          isDark={isDark}
          bottomBar={bottomBar}
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
      </div>
    </div>
  );
}
