"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Instagram, X, Download, Copy, Check } from "lucide-react";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const ADMIN_CLERK_IDS = (process.env.NEXT_PUBLIC_ADMIN_CLERK_IDS || "").split(",").map(s => s.trim()).filter(Boolean);

interface Professional {
  id: string;
  nombre: string;
  apellido: string;
  slug: string;
  oficios: string[];
  barrio: string;
  foto?: string | null;
  activo: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
}

interface Report {
  id: string;
  category: string;
  description: string;
  barrio: string;
  direccion: string;
  isUrgent: boolean;
  createdAt: string;
}

interface Review {
  id: string;
  reviewerName: string;
  score: number;
  comment: string;
  createdAt: string;
  professional: { nombre: string; apellido: string; slug: string };
}

interface Comercio {
  id: string;
  nombre: string;
  rubro: string;
  slug: string;
  barrio: string;
  foto?: string | null;
  logo?: string | null;
  activo: boolean;
  isPremium: boolean;
  createdAt: string;
}

type Tab = "professionals" | "reports" | "reviews" | "comercios";
type ShareFormat = "story" | "feed";

interface ShareTarget {
  type: "comercio" | "profesional";
  shareUrl: string;
  profileUrl: string;
  label: string;
}

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function resolvePhoto(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${NEXT_PUBLIC_API_URL}${path}`;
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

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(target.profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: select text */
    }
  }

  async function handle(format: ShareFormat) {
    setLoading(format);
    const url = `${target.shareUrl}&format=${format}`;
    const filename = `${target.type}-${format}.png`;
    try {
      await downloadAndShare(url, filename);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 1300, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
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
          <button
            onClick={() => handle("story")}
            disabled={!!loading}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            <div className="w-10 h-16 rounded-lg border-2 border-gray-600 bg-gray-800 flex items-center justify-center">
              {loading === "story" ? (
                <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
              ) : (
                <Instagram className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className="text-xs font-semibold text-gray-300">Story</span>
            <span className="text-[10px] text-gray-600">1080 x 1920</span>
          </button>

          <button
            onClick={() => handle("feed")}
            disabled={!!loading}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            <div className="w-14 h-14 rounded-lg border-2 border-gray-600 bg-gray-800 flex items-center justify-center">
              {loading === "feed" ? (
                <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
              ) : (
                <Instagram className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className="text-xs font-semibold text-gray-300">Feed</span>
            <span className="text-[10px] text-gray-600">1080 x 1080</span>
          </button>
        </div>

        <div className="mt-4 border-t border-gray-800 pt-4">
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-colors text-sm font-semibold text-gray-300"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "¡Link copiado!" : "Copiar link del perfil"}
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

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("professionals");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);

  const isAdmin = isLoaded && user && ADMIN_CLERK_IDS.includes(user.id);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/"); return; }
    if (!ADMIN_CLERK_IDS.includes(user.id)) { router.push("/"); return; }
    loadAll();
  }, [isLoaded, user]);

  async function loadAll() {
    setLoading(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [proRes, repRes, revRes, comRes] = await Promise.all([
        fetch(`${API}/api/admin/professionals`, { headers }),
        fetch(`${API}/api/admin/reports`, { headers }),
        fetch(`${API}/api/admin/reviews`, { headers }),
        fetch(`${API}/api/admin/comercios`, { headers }),
      ]);
      if (proRes.ok) setProfessionals(await proRes.json());
      if (repRes.ok) setReports(await repRes.json());
      if (revRes.ok) setReviews(await revRes.json());
      if (comRes.ok) setComercios(await comRes.json());
    } finally {
      setLoading(false);
    }
  }

  async function deleteProfessional(id: string) {
    if (!confirm("¿Seguro que querés eliminar este profesional? Se van a borrar también sus conversaciones y reseñas.")) return;
    setDeletingId(id);
    const token = await getToken();
    const res = await fetch(`${API}/api/admin/professionals/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setProfessionals(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  }

  async function deleteReport(id: string) {
    if (!confirm("¿Eliminar este reporte?")) return;
    setDeletingId(id);
    const token = await getToken();
    const res = await fetch(`${API}/api/admin/reports/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setReports(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
  }

  async function togglePremium(com: Comercio) {
    const token = await getToken();
    const res = await fetch(`${API}/api/admin/comercios/${com.id}/premium`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ isPremium: !com.isPremium }),
    });
    if (res.ok) setComercios(prev => prev.map(c => c.id === com.id ? { ...c, isPremium: !com.isPremium } : c));
  }

  async function deleteComerco(id: string) {
    if (!confirm("¿Seguro que querés eliminar este comercio? Se van a borrar también sus ofertas y vacantes.")) return;
    setDeletingId(id);
    const token = await getToken();
    const res = await fetch(`${API}/api/admin/comercios/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setComercios(prev => prev.filter(c => c.id !== id));
    setDeletingId(null);
  }

  async function deleteReview(id: string) {
    if (!confirm("¿Eliminar esta reseña?")) return;
    setDeletingId(id);
    const token = await getToken();
    const res = await fetch(`${API}/api/admin/reviews/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setReviews(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
  }

  function openShareComercio(com: Comercio) {
    const params = new URLSearchParams({
      nombre: com.nombre,
      rubro: com.rubro,
      barrio: com.barrio ?? "",
      slug: com.slug,
      foto: resolvePhoto(com.foto),
      logo: resolvePhoto(com.logo),
    });
    setShareTarget({
      type: "comercio",
      shareUrl: `/share/comercio?${params}`,
      profileUrl: `https://reportesreconquista.com/comercio/${com.slug}`,
      label: com.nombre,
    });
  }

  function openShareProfesional(pro: Professional) {
    const params = new URLSearchParams({
      nombre: pro.nombre,
      apellido: pro.apellido,
      oficios: pro.oficios.join(", "),
      barrio: pro.barrio ?? "",
      slug: pro.slug,
      foto: resolvePhoto(pro.foto),
    });
    setShareTarget({
      type: "profesional",
      shareUrl: `/share/profesional?${params}`,
      profileUrl: `https://reportesreconquista.com/profesional/${pro.slug}`,
      label: `${pro.nombre} ${pro.apellido}`,
    });
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const TAB_LABELS: Record<Tab, string> = {
    professionals: `Profesionales (${professionals.length})`,
    reports: `Reportes (${reports.length})`,
    reviews: `Reseñas (${reviews.length})`,
    comercios: `Comercios (${comercios.length})`,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar mapView="profesionales" />

      <div className="max-w-3xl mx-auto px-4 pt-20 pb-40">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Panel de administración</h1>
          <p className="text-sm text-gray-500 mt-0.5">Moderación de contenido</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(["professionals", "comercios", "reports", "reviews"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab === t
                  ? "bg-white text-gray-950"
                  : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />
            ))}
          </div>
        ) : tab === "professionals" ? (
          <div className="flex flex-col gap-2">
            {professionals.length === 0 && (
              <p className="text-sm text-gray-600 text-center py-8">No hay profesionales.</p>
            )}
            {professionals.map(pro => (
              <div key={pro.id} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-900 border border-gray-800">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/profesional/${pro.slug}`} className="font-semibold text-sm text-white hover:underline">
                      {pro.nombre} {pro.apellido}
                    </Link>
                    {!pro.activo && (
                      <span className="text-xs bg-red-900/40 text-red-400 border border-red-800 px-1.5 py-0.5 rounded-full">Inactivo</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 capitalize">{pro.oficios.join(", ")} · {pro.barrio}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {pro.ratingCount > 0 ? `★ ${pro.ratingAvg.toFixed(1)} (${pro.ratingCount})` : "Sin reseñas"} ·
                    {" "}{new Date(pro.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openShareProfesional(pro)}
                    className="px-3 py-1.5 rounded-xl bg-blue-900/30 text-blue-400 border border-blue-800/50 hover:bg-blue-900/60 text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    Compartir
                  </button>
                  <button
                    onClick={() => deleteProfessional(pro.id)}
                    disabled={deletingId === pro.id}
                    className="px-3 py-1.5 rounded-xl bg-red-900/30 text-red-400 border border-red-800/50 hover:bg-red-900/60 text-xs font-medium transition-colors disabled:opacity-40"
                  >
                    {deletingId === pro.id ? "..." : "Eliminar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : tab === "reports" ? (
          <div className="flex flex-col gap-2">
            {reports.length === 0 && (
              <p className="text-sm text-gray-600 text-center py-8">No hay reportes.</p>
            )}
            {reports.map(rep => (
              <div key={rep.id} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-900 border border-gray-800">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-white capitalize">{rep.category.replace(/_/g, " ")}</span>
                    {rep.isUrgent && <span className="text-xs bg-red-900/40 text-red-400 border border-red-800 px-1.5 py-0.5 rounded-full">Urgente</span>}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{rep.description}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {rep.barrio} · {rep.direccion} ·{" "}
                    {new Date(rep.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => deleteReport(rep.id)}
                  disabled={deletingId === rep.id}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-red-900/30 text-red-400 border border-red-800/50 hover:bg-red-900/60 text-xs font-medium transition-colors disabled:opacity-40"
                >
                  {deletingId === rep.id ? "..." : "Eliminar"}
                </button>
              </div>
            ))}
          </div>
        ) : tab === "comercios" ? (
          <div className="flex flex-col gap-2">
            {comercios.length === 0 && (
              <p className="text-sm text-gray-600 text-center py-8">No hay comercios.</p>
            )}
            {comercios.map(com => (
              <div key={com.id} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-900 border border-gray-800">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/comercio/${com.slug}`} className="font-semibold text-sm text-white hover:underline">
                      {com.nombre}
                    </Link>
                    {!com.activo && (
                      <span className="text-xs bg-red-900/40 text-red-400 border border-red-800 px-1.5 py-0.5 rounded-full">Inactivo</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{com.rubro} · {com.barrio}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {new Date(com.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePremium(com)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                      com.isPremium
                        ? "bg-yellow-900/30 text-yellow-400 border-yellow-800/50 hover:bg-yellow-900/60"
                        : "bg-gray-800 text-gray-500 border-gray-700 hover:bg-gray-700"
                    }`}
                  >
                    {com.isPremium ? "★ Premium" : "Free"}
                  </button>
                  <button
                    onClick={() => openShareComercio(com)}
                    className="px-3 py-1.5 rounded-xl bg-green-900/30 text-green-400 border border-green-800/50 hover:bg-green-900/60 text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    Compartir
                  </button>
                  <button
                    onClick={() => deleteComerco(com.id)}
                    disabled={deletingId === com.id}
                    className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-red-900/30 text-red-400 border border-red-800/50 hover:bg-red-900/60 text-xs font-medium transition-colors disabled:opacity-40"
                  >
                    {deletingId === com.id ? "..." : "Eliminar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {reviews.length === 0 && (
              <p className="text-sm text-gray-600 text-center py-8">No hay reseñas.</p>
            )}
            {reviews.map(rev => (
              <div key={rev.id} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-900 border border-gray-800">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-white">{rev.reviewerName}</span>
                    <span className="text-xs text-yellow-400">{"★".repeat(Math.round(rev.score))} {rev.score.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{rev.comment}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Para:{" "}
                    <Link href={`/profesional/${rev.professional.slug}`} className="hover:underline">
                      {rev.professional.nombre} {rev.professional.apellido}
                    </Link>
                    {" "}·{" "}
                    {new Date(rev.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => deleteReview(rev.id)}
                  disabled={deletingId === rev.id}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-red-900/30 text-red-400 border border-red-800/50 hover:bg-red-900/60 text-xs font-medium transition-colors disabled:opacity-40"
                >
                  {deletingId === rev.id ? "..." : "Eliminar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {shareTarget && (
        <ShareModal target={shareTarget} onClose={() => setShareTarget(null)} />
      )}
    </div>
  );
}
