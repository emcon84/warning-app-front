import { Metadata } from "next";
import { Supermarket } from "../types";
import OfertasPageClient from "./OfertasPageClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const metadata: Metadata = {
  title: "Ofertas de supermercados - Reconquista",
  description: "Encontrá las mejores ofertas de los supermercados de Reconquista, Santa Fe. Actualizadas por la comunidad.",
  openGraph: {
    title: "Ofertas de supermercados - Reconquista",
    description: "Encontrá las mejores ofertas de los supermercados de Reconquista, Santa Fe.",
    type: "website",
    siteName: "Reportes Reconquista",
  },
};

async function getSupermarkets(): Promise<Supermarket[]> {
  try {
    const res = await fetch(`${API}/api/supermarkets`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function OfertasPage() {
  const supermarkets = await getSupermarkets();
  return <OfertasPageClient initialSupermarkets={supermarkets} />;
}
