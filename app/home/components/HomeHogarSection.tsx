"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { HOGAR_CATS } from "@/lib/constants/homeConstants";

export function HomeHogarSection() {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25, ease: "easeOut" }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-3">
        <p className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Para tu hogar</p>
        <Link href="/oficios" className={`text-xs flex items-center gap-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
          Ver listado <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {HOGAR_CATS.map(({ label, Icon, image, tag }) => (
          <Link
            key={label}
            href={`/oficios?categoria=${tag}`}
            className="relative h-24 md:h-32 rounded-2xl overflow-hidden active:scale-[0.97] transition-all"
          >
            <Image src={image} alt={label} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-1.5">
              <Icon className="w-4 h-4 text-white flex-shrink-0" />
              <span className="text-sm font-bold text-white">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
