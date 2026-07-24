"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Newspaper, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useReconquistaNews } from "../hooks/useReconquistaNews";

const PORTALS = [
  { key: "reconquistahoy", label: "Reconquista HOY" },
  { key: "reconquistaar", label: "Reconquista.com.ar" },
  { key: "reconquistanoticias", label: "Reconquista Noticias" },
] as const;

const MAX_ARTICLES = 25;

function PortalCarousel({ portal }: { portal: string }) {
  const { isDark } = useTheme();
  const { data: rawArticles, loading } = useReconquistaNews(portal);
  const articles = (rawArticles ?? []).slice(0, MAX_ARTICLES);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const itemWidth = 268;

  useEffect(() => {
    if (!articles || articles.length === 0 || paused) return;
    const t = setInterval(() => {
      setSlide(p => (p + 1) % articles.length);
    }, 5000);
    return () => clearInterval(t);
  }, [articles, paused, articles?.length]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: slide * itemWidth,
      behavior: "smooth",
    });
  }, [slide]);

  if (loading) {
    return (
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={`h-5 w-32 rounded-md animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex-shrink-0 w-64 rounded-2xl overflow-hidden animate-pulse ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
              <div className={`h-36 ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
              <div className="p-3 space-y-2">
                <div className={`h-3 w-20 rounded ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                <div className={`h-4 w-full rounded ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                <div className={`h-4 w-3/4 rounded ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) return null;

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative group/scroll">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory scroll-smooth"
        >
          {articles.map((article, i) => (
            <a
              key={article.id}
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`block flex-shrink-0 w-64 rounded-2xl overflow-hidden group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 snap-start ${
                isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200 shadow-sm"
              }`}
            >
              <div className="h-36 w-full relative overflow-hidden">
                {article.imageUrl ? (
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gradient-to-br from-gray-100 to-gray-200"}`}>
                    <Newspaper className={`w-8 h-8 ${isDark ? "text-gray-700" : "text-gray-400"}`} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                    {article.sourceName}
                  </span>
                </div>
              </div>

              <div className="p-3">
                <h3 className={`text-sm font-bold leading-snug line-clamp-3 ${isDark ? "text-white" : "text-gray-900"} group-hover:underline`}>
                  {article.title}
                </h3>
                <div className={`flex items-center gap-1 mt-2 text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                  <ExternalLink className="w-3 h-3" />
                  <span>Leer en {article.sourceName}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <button
          onClick={() => setSlide(p => (p - 1 + articles.length) % articles.length)}
          className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity ${
            isDark ? "bg-black/60 text-white hover:bg-black/80" : "bg-white/80 text-gray-900 hover:bg-white shadow-md"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setSlide(p => (p + 1) % articles.length)}
          className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity ${
            isDark ? "bg-black/60 text-white hover:bg-black/80" : "bg-white/80 text-gray-900 hover:bg-white shadow-md"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex justify-center gap-1.5 mt-3">
        {articles.slice(0, 8).map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === slide
                ? isDark ? "bg-red-400 w-4" : "bg-red-500 w-4"
                : isDark ? "bg-gray-700" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export function NewsCarousel() {
  const { isDark } = useTheme();
  const [tab, setTab] = useState(0);

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isDark ? "bg-red-900/30" : "bg-red-100"}`}>
            <Newspaper className={`w-4 h-4 ${isDark ? "text-red-400" : "text-red-600"}`} />
          </div>
          <div>
            <h2 className={`text-base font-black ${isDark ? "text-white" : "text-gray-900"}`}>
              Noticias de la Ciudad
            </h2>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-3 overflow-x-auto flex-nowrap scrollbar-hide -mx-1 px-1">
        {PORTALS.map((p, i) => (
          <button
            key={p.key}
            onClick={() => setTab(i)}
            className={`text-sm font-semibold whitespace-nowrap px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
              i === tab
                ? isDark
                  ? "bg-red-900/40 text-red-300"
                  : "bg-red-100 text-red-700"
                : isDark
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <PortalCarousel portal={PORTALS[tab].key} />
    </section>
  );
}
