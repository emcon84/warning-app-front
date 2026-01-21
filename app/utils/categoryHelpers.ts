import { ReportCategory } from "../types";

export const getCategoryLabel = (category: ReportCategory): string => {
  const labels: Record<ReportCategory, string> = {
    basura: "🗑️ Recolección de basura",
    alumbrado: "💡 Alumbrado público",
    baches: "🚧 Baches en vía pública",
    pastizales: "🌿 Limpieza de pastizales",
  };
  return labels[category];
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
