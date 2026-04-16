"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  activo: boolean;
  createdAt: string;
}

type Tab = "professionals" | "reports" | "reviews" | "comercios";

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

      <div className="max-w-3xl mx-auto px-4 pt-20 pb-12">
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
                <button
                  onClick={() => deleteProfessional(pro.id)}
                  disabled={deletingId === pro.id}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-red-900/30 text-red-400 border border-red-800/50 hover:bg-red-900/60 text-xs font-medium transition-colors disabled:opacity-40"
                >
                  {deletingId === pro.id ? "..." : "Eliminar"}
                </button>
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
                <button
                  onClick={() => deleteComerco(com.id)}
                  disabled={deletingId === com.id}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-red-900/30 text-red-400 border border-red-800/50 hover:bg-red-900/60 text-xs font-medium transition-colors disabled:opacity-40"
                >
                  {deletingId === com.id ? "..." : "Eliminar"}
                </button>
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
    </div>
  );
}
