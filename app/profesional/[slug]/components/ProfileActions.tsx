"use client";

import type { ProfessionalDetail } from "../../../types";

interface Props {
  pro: Pick<ProfessionalDetail, "id" | "nombre"> & { whatsapp?: string | null };
  isFav: boolean;
  favLoading: boolean;
  recommended: boolean;
  recCount: number;
  copied: boolean;
  isDark: boolean;
  bottomBar: string;
  secBtn: string;
  onWhatsapp: () => void;
  onChat: () => void;
  onRecommend: () => void;
  onShare: () => void;
  onToggleFav: () => void;
  onCopy: () => void;
}

export function ProfileActions({
  pro, isFav, favLoading, recommended, recCount, copied,
  isDark, bottomBar, secBtn,
  onWhatsapp, onChat, onRecommend, onShare, onToggleFav, onCopy,
}: Props) {
  return (
    <div className={`flex-shrink-0 px-4 pt-3 pb-3 border-t ${bottomBar}`}>
      <div className="flex flex-col gap-2">
        {pro.whatsapp ? (
          <button
            onClick={onWhatsapp}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-colors bg-green-600 hover:bg-green-500 text-white flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contactar por WhatsApp
          </button>
        ) : (
          <button
            onClick={onChat}
            className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-colors ${
              isDark ? "bg-white text-gray-950 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            Contactar
          </button>
        )}

        <button
          onClick={onRecommend}
          disabled={recommended}
          className={"w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-colors " + (recommended
            ? (isDark ? "bg-green-900/30 border border-green-800 text-green-400 cursor-default" : "bg-green-50 border border-green-200 text-green-700 cursor-default")
            : "bg-amber-500 hover:bg-amber-400 text-white")}
        >
          {recommended ? (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Recomendado &middot; {recCount}</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 1.99l-3.714 5.06a2 2 0 00-.373 1.169V19a2 2 0 002 2h.095c.497 0 .905-.402.905-.9V16.91c0-.333.215-.627.527-.738l2.527-.946" /></svg>{recCount > 0 ? "Recomendar · " + recCount : "Recomendar"}</>
          )}
        </button>

        <div className="flex gap-2">
          <button
            onClick={onShare}
            className="flex-1 flex items-center justify-center py-3 rounded-2xl border transition-colors text-sm font-medium gap-1.5"
            style={{ borderColor: isDark ? "#374151" : "#e5e7eb", color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>

          <button
            onClick={onToggleFav}
            disabled={favLoading}
            title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
            className={`flex-1 flex items-center justify-center py-3 rounded-2xl text-sm transition-colors border ${
              isFav ? "bg-red-900/40 border-red-800 text-red-400 hover:bg-red-900/60" : secBtn
            }`}
          >
            <svg className="w-4 h-4" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <button
            onClick={onCopy}
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
    </div>
  );
}
