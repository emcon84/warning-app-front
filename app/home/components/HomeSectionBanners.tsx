"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SECTION_BANNERS } from "../../lib/constants/homeConstants";

export function HomeSectionBanners() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
      className="mb-6 -mx-4 px-4 md:mx-0 md:px-0"
    >
      <div className="flex gap-3 overflow-x-auto scrollbar-hide md:overflow-visible md:grid md:grid-cols-6 pb-1">
        {SECTION_BANNERS.map(({ label, sub, href, Icon, gradient, glow }) => (
          <Link
            key={label}
            href={href}
            className={`flex-shrink-0 w-40 h-[108px] rounded-2xl bg-gradient-to-br ${gradient} shadow-lg ${glow} flex flex-col p-4 transition-transform active:scale-[0.97] hover:scale-[1.02] md:w-auto md:flex-1`}
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="mt-auto">
              <p className="text-white font-black text-sm leading-tight">{label}</p>
              <p className="text-white/70 text-[10px] mt-0.5 leading-snug line-clamp-1">{sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
