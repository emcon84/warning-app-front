"use client";

import Link from "next/link";
import type { Professional } from "@/types";
import { ProfessionalAvatar } from "./ProfessionalAvatar";

interface Props {
  pro: Professional;
  dark: boolean;
}

export function FeaturedProfessionalCard({ pro, dark }: Props) {
  return (
    <Link href={`/profesional/${pro.slug}`} className="block">
      <div className="flex flex-col items-center gap-2 cursor-pointer group w-full">
        <div className={`w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 transition-all duration-200 ${dark ? "ring-gray-800 group-hover:ring-gray-500" : "ring-gray-200 group-hover:ring-gray-400 shadow-md"}`}>
          <ProfessionalAvatar foto={pro.foto} nombre={pro.nombre} />
        </div>
        <div className="text-center w-full overflow-hidden">
          <p className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>
            {pro.nombre}
          </p>
          <p className={`text-[11px] capitalize truncate mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>
            {pro.oficios[0]}
          </p>
          {pro.ratingCount > 0 && (
            <div className="flex items-center justify-center gap-0.5 mt-1">
              <svg className="w-3 h-3 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className={`text-[11px] font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>
                {pro.ratingAvg.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
