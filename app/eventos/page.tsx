import type { Metadata } from "next";
import { API_URL } from "@/lib/api/client";
import type { Evento } from "@/lib/types/evento";
import EventosClient from "./EventosClient";

export const metadata: Metadata = {
  title: "Eventos en Reconquista | Reportes Reconquista",
  description: "Descubrí los próximos eventos, shows, ferias y actividades en Reconquista, Santa Fe.",
};

async function getEventos(): Promise<Evento[]> {
  try {
    const res = await fetch(`${API_URL}/api/eventos?upcoming=true`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function EventosPage() {
  const eventos = await getEventos();
  return <EventosClient eventosIniciales={eventos} />;
}
