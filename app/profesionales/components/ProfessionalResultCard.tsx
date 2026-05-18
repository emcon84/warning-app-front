"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import type { Professional } from "../../types";
import { StarRating } from "./StarRating";
import { HeartIcon } from "./HeartIcon";
import { ProfessionalAvatar } from "./ProfessionalAvatar";

import { API_URL } from "../../lib/api/client";

interface Props {
  pro: Professional;
  dark: boolean;
  favIds: Set<string>;
  onToggleFav: (id: string, add: boolean) => void;
}

export function ProfessionalResultCard({ pro, dark, favIds, onToggleFav }: Props) {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const isFav = favIds.has(pro.id);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn || loading) return;
    setLoading(true);
    const wasAdding = !isFav;
    onToggleFav(pro.id, wasAdding);
    try {
      const token = await getToken();
      if (!token) { onToggleFav(pro.id, !wasAdding); return; }
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const res = wasAdding
        ? await fetch(`${API_URL}/api/favorites`, { method: "POST", headers, body: JSON.stringify({ professionalId: pro.id }) })
        : await fetch(`${API_URL}/api/favorites/${pro.id}`, { method: "DELETE", headers });
      if (!res.ok) onToggleFav(pro.id, !wasAdding);
    } catch {
      onToggleFav(pro.id, !wasAdding);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Link href={`/profesional/${pro.slug}`}>
      <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${dark ? "bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"}`}>
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow">
          <ProfessionalAvatar foto={pro.foto} nombre={pro.nombre} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
              {pro.nombre} {pro.apellido}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${pro.disponible ? "bg-green-900/40 text-green-400 border-green-800" : dark ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
              {pro.disponible ? "Disponible" : "No disponible"}
            </span>
          </div>
          <p className={`text-sm capitalize mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {pro.oficios.join(", ")}
          </p>
          <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>
            {pro.barrio}
          </p>
          <div className="mt-1.5">
            <StarRating rating={pro.ratingAvg} count={pro.ratingCount} dark={dark} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isSignedIn && (
            <button onClick={toggle} disabled={loading} className="group p-1.5 rounded-full">
              <HeartIcon filled={isFav} dark={dark} />
            </button>
          )}
          <svg className={`w-5 h-5 ${dark ? "text-gray-600" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
