import { ReportCategory } from "../types";
import { Trash2, Lightbulb, Construction, Trees } from "lucide-react";
import { createElement } from "react";

export const getCategoryLabel = (category: ReportCategory): string => {
  const labels: Record<ReportCategory, string> = {
    basura: "Recolección de basura",
    alumbrado: "Alumbrado público",
    baches: "Baches en vía pública",
    pastizales: "Limpieza de pastizales",
  };
  return labels[category];
};

export const getCategoryIcon = (category: ReportCategory) => {
  const icons = {
    basura: Trash2,
    alumbrado: Lightbulb,
    baches: Construction,
    pastizales: Trees,
  };
  return icons[category];
};

export const getCategoryIconSvg = (category: ReportCategory): string => {
  const svgs: Record<ReportCategory, string> = {
    basura: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    alumbrado: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
    baches: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`,
    pastizales: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/></svg>`,
  };
  return svgs[category];
};

export const getCategoryColor = (category: ReportCategory): string => {
  const colors: Record<ReportCategory, string> = {
    basura: "bg-orange-100 text-orange-800 border-orange-300",
    alumbrado: "bg-yellow-100 text-yellow-800 border-yellow-300",
    baches: "bg-red-100 text-red-800 border-red-300",
    pastizales: "bg-green-100 text-green-800 border-green-300",
  };
  return colors[category];
};
