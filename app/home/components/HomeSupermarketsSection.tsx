"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { Supermarket } from "@/types";

interface Props {
  supermarkets: Supermarket[];
}

export function HomeSupermarketsSection({ supermarkets }: Props) {
  const { isDark } = useTheme();

  if (supermarkets.length === 0) return null;

  const cardBg    = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const cardHover = isDark ? "hover:border-gray-700" : "hover:border-gray-300";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const emptyBg   = isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500";

  function LogoOrInitial({ s }: { s: Supermarket }) {
    if (s.logo) {
      return (
        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center">
          <Image src={s.logo} alt={s.name} fill className="object-contain" unoptimized />
        </div>
      );
    }
    return (
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${emptyBg}`}>
        {s.name[0].toUpperCase()}
      </div>
    );
  }

  function OfferBadge({ count }: { count?: number }) {
    if (!count || count <= 0) return null;
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
        {count} ofertas
      </span>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.35, ease: "easeOut" }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-3">
        <p className={`text-base font-bold ${textPrimary}`}>Ofertas de supermercados</p>
        <Link href="/ofertas" className={`text-xs flex items-center gap-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
          Ver todas <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>
          {supermarkets.slice(0, 8).map((s) => (
            <Link
              key={s.id}
              href={`/ofertas/${s.id}`}
              className={`w-36 flex-shrink-0 p-3 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all active:scale-[0.97] ${cardBg} ${cardHover}`}
            >
              <LogoOrInitial s={s} />
              <p className={`text-xs font-semibold truncate w-full ${textPrimary}`}>{s.name}</p>
              <OfferBadge count={s.offerCount} />
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-3">
        {supermarkets.slice(0, 10).map((s) => (
          <Link
            key={s.id}
            href={`/ofertas/${s.id}`}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all active:scale-[0.97] ${cardBg} ${cardHover}`}
          >
            <LogoOrInitial s={s} />
            <p className={`text-xs font-semibold truncate w-full ${textPrimary}`}>{s.name}</p>
            <OfferBadge count={s.offerCount} />
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
