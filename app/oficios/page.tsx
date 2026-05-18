import OficiosClient from "./OficiosClient";
import { Professional } from "../types";

import { API_URL } from "../lib/api/client";

async function getProfessionals(): Promise<Professional[]> {
  try {
    const res = await fetch(`${API_URL}/api/professionals`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

interface PageProps {
  searchParams: Promise<{ categoria?: string; tipo?: string }>;
}

export default async function OficiosPage({ searchParams }: PageProps) {
  const { categoria, tipo } = await searchParams;
  const professionals = await getProfessionals();
  return <OficiosClient professionals={professionals} initialCategoria={categoria} initialTipo={tipo} />;
}
