"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { ProfessionalDetail, PublicReview } from "../../types";
import Navbar from "../../components/Navbar";
import { useTheme } from "../../contexts/ThemeContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const SITE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://reportesreconquista.com";

interface Props {
  pro: ProfessionalDetail;
  slug: string;
}

const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

function Stars({ score, size = "sm", dark = true }: { score: number; size?: "sm" | "md"; dark?: boolean }) {
  const cls = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${cls} ${i <= score ? "text-yellow-400" : dark ? "text-gray-700" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="focus:outline-none"
        >
          <svg className={`w-7 h-7 transition-colors ${i <= (hover || value) ? "text-yellow-400" : "text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ProfileClient({ pro, slug }: Props) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [copied, setCopied] = useState(false);
  const [recommended, setRecommended] = useState(false);
  const [recCount, setRecCount] = useState(pro.recommendations || 0);
  const profileUrl = `${SITE_URL}/profesional/${pro.slug}`;
  const { isDark } = useTheme();

  // Favorito
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalContext, setLoginModalContext] = useState<"fav" | "review">("fav");

  // Reviews
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Formulario
  const [showForm, setShowForm] = useState(false);
  const [formScore, setFormScore] = useState(0);
  const [formName, setFormName] = useState("");
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  // Cargar estado de favorito si está logueado
  useEffect(() => {
    if (!isSignedIn) return;
    getToken().then((token) => {
      if (!token) return;
      fetch(`${API}/api/favorites`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((favs: { Professional: { slug: string } }[]) => {
          setIsFav(favs.some((f) => f.Professional?.slug === slug));
        })
        .catch(() => {});
    });
  }, [isSignedIn, slug]);

  async function toggleFav() {
    if (!isSignedIn) { setLoginModalContext("fav"); setShowLoginModal(true); return; }
    setFavLoading(true);
    const wasAdding = !isFav;
    setIsFav(wasAdding); // optimistic
    try {
      const token = await getToken();
      console.log("[fav] token:", token ? token.slice(0, 30) + "..." : "NULL");
      if (!token) { setIsFav(!wasAdding); return; }
      const headers: Record<string, string> = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      const res = wasAdding
        ? await fetch(`${API}/api/favorites`, { method: "POST", headers, body: JSON.stringify({ professionalId: pro.id }) })
        : await fetch(`${API}/api/favorites/${pro.id}`, { method: "DELETE", headers });
      if (!res.ok) {
        console.error("[fav] API error:", res.status, await res.text());
        setIsFav(!wasAdding); // revert
      }
    } catch (err) {
      console.error("[fav] fetch error:", err);
      setIsFav(!wasAdding); // revert
    } finally {
      setFavLoading(false);
    }
  }

  useEffect(() => {
    fetch(`${API}/api/professionals/${slug}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [slug]);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (formScore === 0 || formComment.trim().length < 10) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const clerkToken = await getToken();
      const clientToken = typeof window !== "undefined" ? localStorage.getItem("clientToken") : null;
      const res = await fetch(`${API}/api/professionals/${slug}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(clerkToken ? { Authorization: `Bearer ${clerkToken}` } : {}),
        },
        body: JSON.stringify({
          score: formScore,
          comment: formComment.trim(),
          reviewerName: formName.trim() || undefined,
          clientToken: clientToken || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar opinión");
      }
      const newReview: PublicReview = await res.json();
      setReviews((prev) => [newReview, ...prev]);
      setSubmitSuccess(true);
      setShowForm(false);
      setFormScore(0);
      setFormName("");
      setFormComment("");
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
      await fetch(`${API}/api/professionals/${slug}/reviews/${reviewId}/report`, {
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

  const bg          = isDark ? "bg-gray-950"                                      : "bg-gray-50";
  const textPrimary  = isDark ? "text-white"                                       : "text-gray-900";
  const textSec      = isDark ? "text-gray-400"                                    : "text-gray-500";
  const textMuted    = isDark ? "text-gray-500"                                    : "text-gray-400";
  const cardBg       = isDark ? "bg-gray-900 border-gray-800"                      : "bg-white border-gray-200";
  const tagBg        = isDark ? "bg-gray-800 border-gray-700 text-gray-300"        : "bg-gray-100 border-gray-200 text-gray-600";
  const inputCls     = isDark ? "bg-gray-800 border-gray-700 placeholder-gray-600" : "bg-white border-gray-300 placeholder-gray-400";
  const inputColor   = isDark ? "#f9fafb"                                          : "#111827";

  useEffect(() => {
    if (typeof window !== "undefined")
      setRecommended(!!localStorage.getItem("rec_pro_" + pro.slug));
  }, [pro.slug]);

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

  const bottomBar    = isDark ? `${bg} border-gray-900`                            : "bg-white border-gray-200";
  const secBtn       = isDark ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700" : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200";
  const starEmpty    = isDark ? "text-gray-700"                                    : "text-gray-300";

  return (
    <div className={`h-screen ${bg} ${textPrimary} flex flex-col overflow-hidden transition-colors`}>
      <Navbar totalReports={0} onMenuClick={() => {}} sidebarDisabled mapView="profesionales" />

      {/* Modal: requiere login para favoritos */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowLoginModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-indigo-900/50 border border-indigo-800 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-white text-lg">
                {loginModalContext === "review" ? "Iniciá sesión para opinar" : "Guardá tus favoritos"}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {loginModalContext === "review"
                  ? "Necesitás una cuenta para dejar opiniones. Además, solo pueden opinar usuarios que contactaron al profesional."
                  : "Creá una cuenta gratis para guardar profesionales favoritos y acceder a ellos desde cualquier dispositivo."}
              </p>
            </div>
            <button
              onClick={() => router.push("/sign-up")}
              className="w-full py-3 rounded-2xl bg-white text-gray-950 font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              Crear cuenta gratis
            </button>
            <button
              onClick={() => { router.push("/sign-in"); }}
              className="w-full py-2.5 rounded-2xl text-gray-400 text-sm hover:text-white transition-colors"
            >
              Ya tengo cuenta
            </button>
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-300 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Contenido: flex col debajo del navbar — pb-16 reserva espacio para la bottom nav */}
      <div className="flex flex-col flex-1 overflow-hidden max-w-xl md:max-w-3xl mx-auto w-full pb-16">

        {/* BLOQUE FIJO: header + descripción */}
        <div className="flex-shrink-0 px-4 pt-16 pb-3">

        {/* Volver */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-1.5 text-sm mb-4 transition-colors ${textSec} hover:${textPrimary}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        {/* Header del perfil */}
        <div className="flex items-start gap-5 mb-6">
          <div className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-100"}`}>
            {pro.foto ? (
              <img src={pro.foto?.startsWith("/uploads/") ? `${API}${pro.foto}` : pro.foto} alt={pro.nombre} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-4xl font-bold ${textMuted}`}>
                {pro.nombre[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className={`text-xl font-bold ${textPrimary}`}>{pro.nombre} {pro.apellido}</h1>
              {pro.slug.startsWith("test-") && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 leading-none">
                  PERFIL DE PRUEBA
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {pro.oficios.map((o) => (
                <span key={o} className={`text-xs px-2.5 py-1 rounded-full border capitalize ${tagBg}`}>
                  {o}
                </span>
              ))}
            </div>
            <p className={`text-sm mt-1.5 ${textMuted}`}>{pro.barrio}, Reconquista</p>
            <div className="flex items-center gap-2 mt-2">
              <Stars score={Math.round(pro.ratingAvg)} size="sm" dark={isDark} />
              <span className={`text-sm ${textSec}`}>
                {pro.ratingCount > 0
                  ? `${pro.ratingAvg.toFixed(1)} (${pro.ratingCount} opinión${pro.ratingCount !== 1 ? "es" : ""})`
                  : "Sin opiniones aún"}
              </span>
            </div>
            {pro.disponible ? (
              <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full border ${isDark ? "bg-green-900/50 text-green-400 border-green-800" : "bg-green-100 text-green-700 border-green-300"}`}>
                Disponible
              </span>
            ) : (
              <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full border ${isDark ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-500 border-gray-300"}`}>
                No disponible
              </span>
            )}
          </div>
        </div>

        </div>{/* fin bloque fijo */}

        {/* BLOQUE SCROLLEABLE: descripcion + fotos + opiniones */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">

        {/* Descripción */}
        {pro.descripcion && (
          <div className={`mb-4 p-4 rounded-2xl border ${cardBg}`}>
            <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{pro.descripcion}</p>
          </div>
        )}

        {/* Fotos de trabajos */}
        {pro.fotos && pro.fotos.length > 0 && (
          <div className="mb-4">
            <p className={`text-sm font-medium mb-2 ${textSec}`}>Trabajos realizados</p>
            <div className="grid grid-cols-3 gap-2">
              {pro.fotos.map((url, i) => (
                <div key={i} className={`aspect-square rounded-xl overflow-hidden border ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                  <img src={url} alt={`Trabajo ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección Opiniones */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Opiniones{reviews.length > 0 ? ` (${reviews.length})` : ""}
            </p>
            {!showForm && !submitSuccess && isSignedIn && (
              <button
                onClick={() => setShowForm(true)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${tagBg} hover:opacity-80`}
              >
                + Dejar opinión
              </button>
            )}
            {!showForm && !submitSuccess && !isSignedIn && (
              <button
                onClick={() => { setLoginModalContext("review"); setShowLoginModal(true); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${tagBg} hover:opacity-80`}
              >
                + Dejar opinión
              </button>
            )}
          </div>

          {/* Mensaje de éxito */}
          {submitSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-green-900/30 border border-green-800 text-sm text-green-400">
              ¡Gracias por tu opinión!
            </div>
          )}


          {/* Lista de reviews */}
          {loadingReviews ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className={`h-20 rounded-2xl border animate-pulse ${cardBg}`} />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="flex flex-col gap-3">
              {reviews.map((r) => (
                <div key={r.id} className={`p-4 rounded-2xl border ${cardBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                        {r.reviewerName[0].toUpperCase()}
                      </div>
                      <span className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>{r.reviewerName}</span>
                    </div>
                    <Stars score={r.score} size="sm" dark={isDark} />
                  </div>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{r.comment}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className={`text-xs ${textMuted}`}>
                      {new Date(r.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    <button
                      onClick={() => handleReport(r.id)}
                      disabled={reportedIds.has(r.id)}
                      className={`text-xs transition-colors ${
                        reportedIds.has(r.id)
                          ? "text-orange-400 cursor-default"
                          : isDark ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {reportedIds.has(r.id) ? "Reportada" : "Reportar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className={`text-sm ${textMuted}`}>Aun no hay opiniones.</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className={`mt-2 text-sm underline transition-colors ${textSec} hover:${textPrimary}`}
                >
                  Sé el primero en opinar
                </button>
              )}
            </div>
          )}
        </div>
        </div>{/* fin bloque scrolleable */}

        {/* Bottom sheet: formulario nueva opinión */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4" onClick={() => { setShowForm(false); setSubmitError(""); }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <form
              onSubmit={handleSubmitReview}
              onClick={(e) => e.stopPropagation()}
              className={`relative flex flex-col gap-3 rounded-t-3xl md:rounded-3xl border-t md:border px-4 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] md:pb-5 md:max-w-lg md:w-full ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
            >
              <div className={`w-10 h-1 rounded-full mx-auto mb-1 ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

              <div>
                <p className={`text-xs mb-2 ${textSec}`}>Tu calificación</p>
                <StarPicker value={formScore} onChange={setFormScore} />
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>Tu nombre <span className={textMuted}>(opcional)</span></label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Vecino anónimo"
                  maxLength={60}
                  style={{ color: inputColor, backgroundColor: isDark ? "#1f2937" : "#ffffff" }}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                />
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>
                  Comentario <span className={textMuted}>({formComment.length}/500)</span>
                </label>
                <textarea
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value.slice(0, 500))}
                  placeholder="¿Cómo fue tu experiencia con este profesional?"
                  rows={3}
                  style={{ color: inputColor, backgroundColor: isDark ? "#1f2937" : "#ffffff" }}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-none ${inputCls}`}
                />
                {formComment.length > 0 && formComment.length < 10 && (
                  <p className="text-xs text-yellow-600 mt-1">Mínimo 10 caracteres.</p>
                )}
              </div>

              {submitError && (
                <p className="text-xs text-red-400">{submitError}</p>
              )}

          <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setSubmitError(""); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm transition-colors border ${secBtn}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formScore === 0 || formComment.trim().length < 10 || submitting}
                  className="flex-1 py-2.5 rounded-xl bg-white text-gray-950 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  {submitting ? "Enviando..." : "Publicar"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Botones de acción: flex item natural, aparece arriba de la bottom nav gracias al pb-16 del padre */}
        <div className={`flex-shrink-0 px-4 pt-3 pb-3 border-t ${bottomBar}`}>
        <div className="flex flex-col gap-2">
          {pro.whatsapp ? (
            <button
              onClick={() => {
                const msg = `Hola ${pro.nombre}, te contacto desde Reportes Reconquista. `;
                window.open(`https://wa.me/${pro.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
              }}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-colors bg-green-600 hover:bg-green-500 text-white flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Contactar por WhatsApp
            </button>
          ) : (
            <button
              onClick={() => router.push(`/chat/nuevo?professionalId=${pro.id}`)}
              className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-colors ${
                isDark ? "bg-white text-gray-950 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              Contactar
            </button>
          )}

          <button
            onClick={handleRecommend}
            disabled={recommended}
            className={"w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-colors " + (recommended ? (isDark ? "bg-green-900/30 border border-green-800 text-green-400 cursor-default" : "bg-green-50 border border-green-200 text-green-700 cursor-default") : "bg-amber-500 hover:bg-amber-400 text-white")}
          >
            {recommended ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Recomendado &middot; {recCount}</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 1.99l-3.714 5.06a2 2 0 00-.373 1.169V19a2 2 0 002 2h.095c.497 0 .905-.402.905-.9V16.91c0-.333.215-.627.527-.738l2.527-.946" /></svg>{recCount > 0 ? "Recomendar · " + recCount : "Recomendar"}</>
            )}
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center py-3 rounded-2xl border transition-colors text-sm font-medium gap-1.5"
              style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: isDark ? "#9ca3af" : "#6b7280" }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>

            <button
              onClick={toggleFav}
              disabled={favLoading}
              title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
              className={`flex-1 flex items-center justify-center py-3 rounded-2xl text-sm transition-colors border ${
                isFav
                  ? "bg-red-900/40 border-red-800 text-red-400 hover:bg-red-900/60"
                  : secBtn
              }`}
            >
              <svg className="w-4 h-4" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            <button
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center py-3 rounded-2xl text-sm transition-colors border ${secBtn}`}
            >
              {copied ? "✓" : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        </div>{/* fin botones */}

      </div>
    </div>
  );
}
