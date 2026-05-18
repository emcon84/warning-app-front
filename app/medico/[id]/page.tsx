import { Metadata } from "next";
import { notFound } from "next/navigation";
import MedicoClient from "./MedicoClient";
import { Doctor } from "@/types";

import { API_URL } from "@/lib/api/client";

async function getDoctor(id: string): Promise<Doctor | null> {
  try {
    const res = await fetch(`${API_URL}/api/doctors/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const doctor = await getDoctor(id);
  if (!doctor) return { title: "Médico no encontrado" };
  return {
    title: `Dr/a. ${doctor.nombre} — ${doctor.especialidad} | Reconquista`,
    description: `${doctor.especialidad} en ${doctor.barrio}, Reconquista. ${doctor.obrasSociales?.join(", ")}`,
  };
}

export default async function MedicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctor = await getDoctor(id);
  if (!doctor) notFound();
  return <MedicoClient doctor={doctor} />;
}
