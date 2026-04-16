import { Metadata } from "next";
import { Professional } from "../types";
import ProfesionalesClient from "./ProfesionalesClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const metadata: Metadata = {
  title: "Profesionales de Oficio - Reconquista",
  description:
    "Encontrá plomeros, electricistas, pintores y más oficios en Reconquista. Calificados por vecinos reales.",
  openGraph: {
    title: "Profesionales de Oficio - Reconquista",
    description: "Encontrá profesionales de oficio calificados por vecinos de Reconquista.",
    type: "website",
    siteName: "Reportes Reconquista",
  },
};

async function getProfessionals(): Promise<Professional[]> {
  try {
    const res = await fetch(`${API}/api/professionals`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ProfesionalesPage() {
  const professionals = await getProfessionals();
  return <ProfesionalesClient professionals={professionals} />;
}
