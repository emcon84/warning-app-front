import OfiiciosClient from "./OficiosClient";
import { Professional } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getProfessionals(): Promise<Professional[]> {
  try {
    const res = await fetch(`${API}/api/professionals`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function OficiosPage() {
  const professionals = await getProfessionals();
  return <OfiiciosClient professionals={professionals} />;
}
