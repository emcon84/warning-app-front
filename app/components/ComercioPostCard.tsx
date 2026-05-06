"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Tag, Gift, Clock, Heart, Share2, MessageCircle } from "lucide-react";
import type { ComercioPost } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function photoUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.startsWith("/uploads/") ? `${API}${url}` : url;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  return `hace ${days} dias`;
}

const TIPO_CONFIG = {
  novedad: { icon: Megaphone, label: "Novedad", badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  oferta:  { icon: Tag,       label: "Oferta",  badge: "bg-green-500/15 text-green-600 dark:text-green-400"  },
  sorteo:  { icon: Gift,      label: "Sorteo",  badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
};

interface Props {
  post: ComercioPost;
  variant?: "feed" | "slide";
  isDark?: boolean;
  comercioWhatsapp?: string;
}

export default function ComercioPostCard({ post, variant = "feed", isDark, comercioWhatsapp }: Props) {
  const router = useRouter();

  const storageKey = `liked_post_${post.id}`;
  const [liked, setLiked] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(storageKey);
  });
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);
  const [sharing, setSharing] = useState(false);

  const config = TIPO_CONFIG[post.tipo as keyof typeof TIPO_CONFIG];
  const Icon = config?.icon ?? Megaphone;
  const label = config?.label ?? "Publicacion";
  const badgeCls = config?.badge ?? "bg-gray-500/15 text-gray-600";

  const foto = photoUrl(post.foto);
  const comercioLogo = photoUrl(post.comercio?.logo || post.comercio?.foto);

  const waNumber = (post.comercio?.whatsapp ?? comercioWhatsapp ?? "").replace(/\D/g, "");
  const tipoLabel = config?.label ?? "publicacion";
  const waText = encodeURIComponent(`Hola! Vi tu ${tipoLabel.toLowerCase()} en Reportes Reconquista: "${post.contenido.slice(0, 80)}"`);
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waText}` : null;

  const cardCls = variant === "slide"
    ? `rounded-2xl border overflow-hidden flex-shrink-0 w-64 cursor-pointer ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`
    : `rounded-2xl border overflow-hidden cursor-pointer ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`;

  function handleClick() {
    router.push(`/post/${post.id}`);
  }

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(c => wasLiked ? Math.max(0, c - 1) : c + 1);
    if (wasLiked) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, "1");
    fetch(`${API}/api/posts/${post.id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unlike: wasLiked }),
    }).catch(() => {});
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/comercio/${post.comercio?.slug ?? ""}`;
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({ title: post.comercio?.nombre ?? "", text: post.contenido.slice(0, 100), url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {}
    setTimeout(() => setSharing(false), 1500);
  }

  if (variant === "slide") {
    return (
      <div className={cardCls} onClick={handleClick}>
        {foto && (
          <img src={foto} alt="" className="w-full h-36 object-cover" />
        )}
        <div className="p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${badgeCls}`}>
              <Icon className="w-3 h-3" />
              {label}
            </span>
            <span className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {timeAgo(post.createdAt)}
            </span>
          </div>

          <p className={`text-xs line-clamp-3 whitespace-pre-wrap ${isDark ? "text-gray-200" : "text-gray-800"}`}>
            {post.contenido}
          </p>

          {post.comercio && (
            <div className="flex items-center gap-1.5 min-w-0 mt-1">
              {comercioLogo ? (
                <img src={comercioLogo} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                  {post.comercio.nombre[0]}
                </div>
              )}
              <span className={`text-[10px] truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {post.comercio.nombre}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 px-0 py-1">
            <button onClick={handleLike} className={`flex items-center gap-1 text-xs ${liked ? "text-red-500" : isDark ? "text-gray-500" : "text-gray-400"}`}>
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500" : ""}`} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
            <button onClick={handleShare} className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardCls} onClick={handleClick}>
      {foto && (
        <img src={foto} alt="" className="w-full h-48 object-cover" />
      )}

      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${badgeCls}`}>
            <Icon className="w-3 h-3" />
            {label}
          </span>
          <span className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            {timeAgo(post.createdAt)}
          </span>
        </div>

        <p className={`text-sm line-clamp-5 whitespace-pre-wrap ${isDark ? "text-gray-200" : "text-gray-800"}`}>
          {post.contenido}
        </p>

        {post.tipo === "oferta" && (post.precioAntes || post.precioDespues) && (
          <div className="flex items-center gap-2">
            {post.precioAntes && (
              <span className="text-xs line-through text-gray-400">{post.precioAntes}</span>
            )}
            {post.precioDespues && (
              <span className="text-sm font-black text-green-500">{post.precioDespues}</span>
            )}
          </div>
        )}

        {post.tipo === "sorteo" && post.fechaSorteo && (
          <div className="flex items-center gap-1 text-xs text-purple-500">
            <Clock className="w-3 h-3" />
            <span>Cierra: {new Date(post.fechaSorteo).toLocaleDateString("es-AR")}</span>
          </div>
        )}
      </div>

      <div className={`flex items-center gap-1 border-t px-4 py-3 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
            liked
              ? "text-red-500 bg-red-500/10"
              : isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>

        <button
          onClick={handleShare}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}
        >
          <Share2 className="w-4 h-4" />
          <span>{sharing ? "Copiado" : "Compartir"}</span>
        </button>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Consultar
          </a>
        )}
      </div>
    </div>
  );
}
