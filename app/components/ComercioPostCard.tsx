"use client";

import { useRouter } from "next/navigation";
import { Megaphone, Tag, Gift, Clock } from "lucide-react";
import { ComercioPost } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function photoUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.startsWith("/uploads/") ? `${API_URL}${url}` : url;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  return `hace ${days} dias`;
}

interface Props {
  post: ComercioPost;
  variant?: "feed" | "slide";
  isDark?: boolean;
}

const TIPO_CONFIG = {
  novedad: {
    Icon: Megaphone,
    label: "Novedad",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  oferta: {
    Icon: Tag,
    label: "Oferta",
    className: "bg-green-500/15 text-green-600 dark:text-green-400",
  },
  sorteo: {
    Icon: Gift,
    label: "Sorteo",
    className: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
} as const;

export default function ComercioPostCard({ post, variant = "feed", isDark }: Props) {
  const router = useRouter();
  const { Icon, label, className } = TIPO_CONFIG[post.tipo];

  const foto = photoUrl(post.foto);
  const comercioLogo = photoUrl(post.comercio?.logo || post.comercio?.foto);

  const isSlide = variant === "slide";

  const cardClass = isSlide
    ? `rounded-2xl border overflow-hidden flex-shrink-0 w-64 cursor-pointer transition-transform active:scale-[0.97] ${
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      }`
    : `rounded-2xl border overflow-hidden cursor-pointer transition-transform active:scale-[0.97] ${
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      }`;

  return (
    <div className={cardClass} onClick={() => router.push(`/comercio/${post.comercio?.slug}`)}>
      {foto && (
        <img
          src={foto}
          alt=""
          className={isSlide ? "w-full h-32 object-cover" : "w-full h-40 object-cover rounded-t-xl"}
        />
      )}

      <div className="p-3 flex flex-col gap-1.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${className}`}>
          <Icon className="w-3 h-3" />
          {label}
        </span>

        <p className={`${isSlide ? "text-xs" : "text-sm"} line-clamp-3 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
          {post.contenido}
        </p>

        {post.tipo === "oferta" && (post.precioAntes || post.precioDespues) && (
          <div className="flex items-center gap-2 mt-1">
            {post.precioAntes && (
              <span className="text-xs line-through text-gray-400">{post.precioAntes}</span>
            )}
            {post.precioDespues && (
              <span className="text-sm font-black text-green-500">{post.precioDespues}</span>
            )}
          </div>
        )}

        {post.tipo === "sorteo" && post.fechaSorteo && (
          <div className="flex items-center gap-1 mt-1 text-xs text-purple-500">
            <Clock className="w-3 h-3" />
            <span>Cierra: {new Date(post.fechaSorteo).toLocaleDateString("es-AR")}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          {isSlide && post.comercio && (
            <div className="flex items-center gap-1.5 min-w-0">
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
          <span className={`text-[10px] ml-auto ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            {timeAgo(post.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
