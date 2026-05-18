import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Supermarket, Offer } from "@/types";
import OffersPageClient from "./OffersPageClient";

import { API_URL } from "@/lib/api/client";

async function getSupermarket(id: string): Promise<Supermarket | null> {
  try {
    const res = await fetch(`${API_URL}/api/supermarkets`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const list: Supermarket[] = await res.json();
    return list.find((s) => s.id === id) ?? null;
  } catch {
    return null;
  }
}

async function getOffers(id: string): Promise<Offer[]> {
  try {
    const res = await fetch(`${API_URL}/api/supermarkets/${id}/offers`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const supermarket = await getSupermarket(id);
  if (!supermarket) return { title: "Ofertas - Reconquista" };

  const title = `Ofertas en ${supermarket.name} - Reconquista`;
  const description = `Mirá las mejores ofertas de ${supermarket.name} en Reconquista, Santa Fe. Actualizadas por la comunidad.`;
  const image = supermarket.logo ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Reportes Reconquista",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function OfertasPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [supermarket, offers] = await Promise.all([getSupermarket(id), getOffers(id)]);

  if (!supermarket) notFound();

  return <OffersPageClient supermarket={supermarket} initialOffers={offers} />;
}
