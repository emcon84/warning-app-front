import { Metadata } from "next";
import { Supermarket } from "../types";
import OfertasPageClient from "./OfertasPageClient";

import { API_URL } from "../lib/api/client";

export const metadata: Metadata = {
  title: "Ofertas de Supermercados en Reconquista, Santa Fe",
  description:
    "Las mejores ofertas y promociones de los supermercados de Reconquista, Santa Fe. Actualizadas por la comunidad de vecinos. Ahorrá en tus compras del día a día.",
  keywords: [
    "ofertas supermercados Reconquista",
    "promociones Reconquista",
    "supermercados Reconquista",
    "ofertas Reconquista Santa Fe",
    "precios Reconquista",
  ],
  alternates: {
    canonical: "https://reportesreconquista.com/ofertas",
  },
  openGraph: {
    title: "Ofertas de Supermercados en Reconquista, Santa Fe",
    description:
      "Las mejores ofertas y promociones de los supermercados de Reconquista, Santa Fe. Actualizadas por la comunidad.",
    type: "website",
    url: "https://reportesreconquista.com/ofertas",
    siteName: "Reportes Reconquista",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ofertas de Supermercados en Reconquista, Santa Fe",
    description: "Las mejores ofertas de los supermercados de Reconquista actualizadas por la comunidad.",
  },
};

async function getSupermarkets(): Promise<Supermarket[]> {
  try {
    const res = await fetch(`/api/supermarkets`, { cache: "no-store" });
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
