import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { API_URL } from "@/lib/api/client";
import type { Evento } from "@/lib/types/evento";
import EventoDetailClient from "./EventoDetailClient";

async function getEvento(slug: string): Promise<Evento | null> {
  try {
    const res = await fetch(`${API_URL}/api/eventos/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const evento = await getEvento(slug);
  if (!evento) return { title: "Evento no encontrado" };
  return {
    title: `${evento.nombre} | Eventos Reconquista`,
    description: evento.descripcion ?? `${evento.nombre} en ${evento.lugar}`,
  };
}

export default async function EventoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = await getEvento(slug);
  if (!evento) notFound();
  return <EventoDetailClient evento={evento} />;
}
