import { Metadata } from "next";
import OfiiciosClient from "./OficiosClient";
import { Professional } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const metadata: Metadata = {
  title: "Oficios y Profesionales en Reconquista",
  description: "Encontra plomeros, electricistas, albañiles, abogados y mas profesionales en Reconquista.",
};

async function getProfessionals(): Promise<Professional[]> {
  try {
    const res = await fetch(`${API}/api/professionals`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function OficiosPage() {
  const professionals = await getProfessionals();
  return <OfiiciosClient professionals={professionals} />;
}
