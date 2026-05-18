import { Metadata } from "next";
import MedicosClient from "./MedicosClient";
import { Doctor } from "../types";

import { API_URL } from "../lib/api/client";

export const metadata: Metadata = {
  title: "Médicos en Reconquista | Reportes Reconquista",
  description: "Encontrá médicos en Reconquista por especialidad y obra social.",
};

async function getDoctors(): Promise<Doctor[]> {
  try {
    const res = await fetch(`${API_URL}/api/doctors`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function MedicosPage() {
  const doctors = await getDoctors();
  return <MedicosClient doctors={doctors} />;
}
