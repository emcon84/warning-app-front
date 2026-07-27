"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { resolvePhotoUrl } from "../lib/utils/photo";
import { useTheme } from "../contexts/ThemeContext";
import { revalidatePublicComercios } from "../actions";
import type { Professional, Report, Review, Comercio, Tab, ShareTarget } from "./types";
import { ShareModal } from "./components/ShareModal";
import { PinModal } from "./components/PinModal";
import { AdminProfessionalsTab } from "./components/AdminProfessionalsTab";
import { AdminReportsTab } from "./components/AdminReportsTab";
import { AdminComerciosTab } from "./components/AdminComerciosTab";
import { AdminReviewsTab } from "./components/AdminReviewsTab";
import { AdminOutreachTab } from "./components/AdminOutreachTab";
import { AdminSlidesTab } from "./components/AdminSlidesTab";

import { API_URL } from "../lib/api/client";
const ADMIN_CLERK_IDS = (process.env.NEXT_PUBLIC_ADMIN_CLERK_IDS || "").split(",").map(s => s.trim()).filter(Boolean);

const TAB_ORDER: Tab[] = ["professionals", "comercios", "reports", "reviews", "outreach", "slides"];

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
  const [pinTarget, setPinTarget] = useState<Professional | null>(null);

  const isAdmin = isLoaded && user && ADMIN_CLERK_IDS.includes(user.id);
  const { isDark } = useTheme();
  const theme = isDark ? "dark" : "light";
  const bgPage = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-gray-500" : "text-gray-400";
  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const tabActive = isDark ? "bg-white text-gray-950" : "bg-gray-900 text-white";
  const tabInactive = isDark ? "bg-gray-900 border-gray-800 text-gray-400 hover:text-white" : "bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-900";

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
        fetch(`${API_URL}/api/admin/professionals`, { headers }),
        fetch(`${API_URL}/api/admin/reports`, { headers }),
        fetch(`${API_URL}/api/admin/reviews`, { headers }),
        fetch(`${API_URL}/api/admin/comercios`, { headers }),
      ]);
      if (proRes.ok) setProfessionals(await proRes.json());
      if (repRes.ok) setReports(await repRes.json());
      if (revRes.ok) setReviews(await revRes.json());
      if (comRes.ok) setComercios(await comRes.json());
    } finally {
      setLoading(false);
    }
  }

  async function loadComercios() {
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API_URL}/api/admin/comercios`, { headers });
      if (res.ok) setComercios(await res.json());
    } catch {
      /* no-op on network error */
    }
  }

  async function deleteProfessional(id: string) {
    if (!confirm("¿Seguro que querés eliminar este profesional? Se van a borrar también sus conversaciones y reseñas.")) return;
    setDeletingId(id);
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/admin/professionals/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setProfessionals(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  }

  async function deleteReport(id: string) {
    if (!confirm("¿Eliminar este reporte?")) return;
    setDeletingId(id);
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/admin/reports/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setReports(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
  }

  async function deleteReview(id: string) {
    if (!confirm("¿Eliminar esta reseña?")) return;
    setDeletingId(id);
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setReviews(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
  }

  async function deleteComerco(id: string) {
    if (!confirm("¿Seguro que querés eliminar este comercio? Se van a borrar también sus ofertas y vacantes.")) return;
    setDeletingId(id);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/admin/comercios/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setComercios(prev => prev.filter(c => c.id !== id));
        revalidatePublicComercios();
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function togglePremium(com: Comercio) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/admin/comercios/${com.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ isPremium: !com.isPremium }),
    });
    if (res.ok) setComercios(prev => prev.map(c => c.id === com.id ? { ...c, isPremium: !com.isPremium } : c));
  }

  async function toggleFounder(com: Comercio) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/admin/comercios/${com.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ isFounder: !com.isFounder }),
    });
    if (res.ok) setComercios(prev => prev.map(c => c.id === com.id ? { ...c, isFounder: !com.isFounder } : c));
  }

  function openShareComercio(com: Comercio) {
    const params = new URLSearchParams({
      nombre: com.nombre,
      rubro: com.rubro,
      barrio: com.barrio ?? "",
      slug: com.slug,
      foto: resolvePhotoUrl(com.foto),
      logo: resolvePhotoUrl(com.logo),
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
      foto: resolvePhotoUrl(pro.foto),
    });
    setShareTarget({
      type: "profesional",
      shareUrl: `/share/profesional?${params}`,
      profileUrl: `https://reportesreconquista.com/profesional/${pro.slug}`,
      label: `${pro.nombre} ${pro.apellido}`,
    });
  }

  const tabLabels: Record<Tab, string> = {
    professionals: `Profesionales (${professionals.length})`,
    reports: `Reportes (${reports.length})`,
    reviews: `Reseñas (${reviews.length})`,
    comercios: `Comercios (${comercios.length})`,
    outreach: "Mensajes",
    slides: "Slides Hero",
  };

  if (!isLoaded || !user) {
    return (
      <div className={`min-h-screen ${bgPage} flex items-center justify-center`}>
        <div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? "border-gray-700 border-t-white" : "border-gray-300 border-t-gray-900"}`} />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className={`min-h-screen ${bgPage} ${textPrimary}`}>
      <Navbar mapView="profesionales" />

      <div className="max-w-3xl mx-auto px-4 pt-20 pb-40">
        <div className="mb-6">
          <h1 className={`text-xl font-bold ${textPrimary}`}>Panel de administración</h1>
          <p className={`text-sm ${textMuted} mt-0.5`}>Moderación de contenido</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TAB_ORDER.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab === t ? tabActive : tabInactive
              }`}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-16 rounded-2xl ${cardBg} animate-pulse`} />
            ))}
          </div>
        ) : tab === "professionals" ? (
          <AdminProfessionalsTab
            professionals={professionals}
            deletingId={deletingId}
            onDelete={deleteProfessional}
            onShare={openShareProfesional}
            onSetPin={setPinTarget}
          />
        ) : tab === "reports" ? (
          <AdminReportsTab reports={reports} deletingId={deletingId} onDelete={deleteReport} />
        ) : tab === "comercios" ? (
          <AdminComerciosTab
            comercios={comercios}
            deletingId={deletingId}
            onDelete={deleteComerco}
            onTogglePremium={togglePremium}
            onToggleFounder={toggleFounder}
            onSetPlan={async (com, plan) => {
              const token = await getToken();
              await fetch(`${API_URL}/api/admin/comercios/${com.id}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
              });
              loadComercios();
            }}
            onShare={openShareComercio}
          />
        ) : tab === "outreach" ? (
          <AdminOutreachTab />
        ) : tab === "slides" ? (
          <AdminSlidesTab />
        ) : (
          <AdminReviewsTab reviews={reviews} deletingId={deletingId} onDelete={deleteReview} />
        )}
      </div>

      {shareTarget && <ShareModal target={shareTarget} onClose={() => setShareTarget(null)} />}
      {pinTarget && <PinModal target={pinTarget} getToken={getToken} onClose={() => setPinTarget(null)} />}
    </div>
  );
}
