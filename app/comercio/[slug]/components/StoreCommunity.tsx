"use client";

import { Users } from "lucide-react";
import type { Comercio, ComercioPost } from "../../../types";
import type { ThemeClasses } from "./types";
import ComercioPostCard from "../../../components/ComercioPostCard";

interface Props {
  comercio: Comercio;
  posts: ComercioPost[];
  loading: boolean;
  theme: ThemeClasses;
  isOwner?: boolean;
  onPublish: () => void;
}

export function StoreCommunity({ comercio, posts, loading, theme, isOwner, onPublish }: Props) {
  const { isDark, textPrimary, textMuted } = theme;

  if (posts.length === 0 && !isOwner) return null;

  return (
    <section className="mt-6 mx-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <div>
            <p className={`font-black text-base ${textPrimary}`}>Comunidad</p>
            <p className={`text-xs ${textMuted}`}>
              {posts.length > 0 ? `${posts.length} publicaciones` : "Aun no hay publicaciones"}
            </p>
          </div>
          {(comercio._count?.suscriptores ?? 0) > 0 && (
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              isDark ? "bg-blue-500/20 border border-blue-500/40 text-blue-400" : "bg-blue-50 border border-blue-200 text-blue-600"
            }`}>
              <Users className="w-3 h-3" />
              {(comercio._count?.suscriptores ?? 0)} miembros
            </span>
          )}
        </div>
        {isOwner && (
          <button
            onClick={onPublish}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            Publicar
          </button>
        )}
      </div>

      {loading && (
        <div className={`text-xs text-center py-4 ${textMuted}`}>Cargando...</div>
      )}

      {!loading && posts.length === 0 && isOwner && (
        <div className={`text-center py-6 rounded-2xl border border-dashed ${isDark ? "border-gray-800 text-gray-600" : "border-gray-200 text-gray-400"}`}>
          <p className="text-sm">Publica novedades, ofertas y sorteos para tu comunidad</p>
          <button
            onClick={onPublish}
            className="mt-2 text-xs px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold transition-colors"
          >
            Primera publicacion
          </button>
        </div>
      )}

      {posts.length > 0 && (
        <div className="flex flex-col gap-3">
          {posts.map(post => (
            <ComercioPostCard key={post.id} post={post} variant="feed" isDark={isDark} comercioWhatsapp={comercio.whatsapp} />
          ))}
        </div>
      )}
    </section>
  );
}
