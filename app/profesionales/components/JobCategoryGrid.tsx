"use client";

import { useMemo } from "react";
import type { Professional } from "../../types";
import { CATEGORIAS_OFICIOS, normalizeText } from "../../lib/utils/professionals";

interface Props {
  professionals: Professional[];
  dark: boolean;
  onSelect: (category: string) => void;
}

export function JobCategoryGrid({ professionals, dark, onSelect }: Props) {
  const norm = (s: string) => normalizeText(s);

  const customCategories = useMemo(() => {
    const predefinedNorm = new Set(CATEGORIAS_OFICIOS.map((c) => norm(c)));
    const custom = new Set<string>();
    professionals
      .filter((p) => p.tipo === "oficio" || p.tipo == null)
      .forEach((p) =>
        (p.oficios ?? []).forEach((o) => {
          const oNorm = norm(o);
          const alreadyCovered = [...predefinedNorm].some(
            (pre) => oNorm.includes(pre) || pre.includes(oNorm)
          );
          if (!alreadyCovered) custom.add(o);
        })
      );
    return [...custom].sort();
  }, [professionals]);

  const allCategories = useMemo(
    () => [...CATEGORIAS_OFICIOS, ...customCategories],
    [customCategories]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    allCategories.forEach((cat) => {
      const catNorm = norm(cat);
      map[cat] = professionals.filter((p) =>
        (p.oficios ?? []).some((o) => norm(o).includes(catNorm) || catNorm.includes(norm(o)))
      ).length;
    });
    return map;
  }, [professionals, allCategories]);

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => {
        const count = counts[cat] ?? 0;
        const isCustom = !CATEGORIAS_OFICIOS.includes(cat);
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              count > 0
                ? dark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
                : dark
                  ? "bg-gray-900 text-gray-600 border border-gray-800 hover:border-gray-700"
                  : "bg-gray-50 text-gray-400 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {cat}
            {count > 0 && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                isCustom
                  ? dark ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"
                  : dark ? "bg-purple-900/50 text-purple-400" : "bg-purple-100 text-purple-600"
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
