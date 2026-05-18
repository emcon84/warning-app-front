import { Metadata } from "next";
import { Professional } from "../types";
import ProfesionalesClient from "./ProfesionalesClient";

import { API_URL } from "../lib/api/client";
const SITE_URL = "https://reportesreconquista.com";

export const metadata: Metadata = {
  title: "Profesionales y Oficios en Reconquista, Santa Fe",
  description:
    "Encontrá plomeros, electricistas, albañiles, pintores, gasistas y más profesionales en Reconquista, Santa Fe. Contacto directo por chat, sin intermediarios ni comisiones.",
  keywords: [
    "plomeros Reconquista",
    "electricistas Reconquista",
    "albañiles Reconquista",
    "pintores Reconquista",
    "gasistas Reconquista",
    "cerrajeros Reconquista",
    "profesionales Reconquista",
    "oficios Reconquista",
    "profesionales Santa Fe",
    "contratistas Reconquista",
    "técnicos Reconquista",
    "jardineros Reconquista",
  ],
  alternates: {
    canonical: `${SITE_URL}/profesionales`,
  },
  openGraph: {
    title: "Profesionales y Oficios en Reconquista, Santa Fe",
    description:
      "Plomeros, electricistas, albañiles y más oficios en Reconquista. Contacto directo por chat, sin intermediarios.",
    type: "website",
    url: `${SITE_URL}/profesionales`,
    siteName: "Reportes Reconquista",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Profesionales y Oficios en Reconquista, Santa Fe",
    description:
      "Plomeros, electricistas, albañiles y más oficios en Reconquista. Contacto directo por chat.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Directorio de profesionales y oficios en Reconquista, Santa Fe",
  description:
    "Directorio de plomeros, electricistas, albañiles, pintores, gasistas, cerrajeros y otros profesionales en Reconquista, Santa Fe, Argentina.",
  url: `${SITE_URL}/profesionales`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Plomeros en Reconquista, Santa Fe" },
    { "@type": "ListItem", position: 2, name: "Electricistas en Reconquista, Santa Fe" },
    { "@type": "ListItem", position: 3, name: "Albañiles en Reconquista, Santa Fe" },
    { "@type": "ListItem", position: 4, name: "Pintores en Reconquista, Santa Fe" },
    { "@type": "ListItem", position: 5, name: "Gasistas en Reconquista, Santa Fe" },
    { "@type": "ListItem", position: 6, name: "Cerrajeros en Reconquista, Santa Fe" },
    { "@type": "ListItem", position: 7, name: "Técnicos en Reconquista, Santa Fe" },
    { "@type": "ListItem", position: 8, name: "Jardineros en Reconquista, Santa Fe" },
  ],
};

async function getProfessionals(): Promise<Professional[]> {
  try {
    const res = await fetch(`${API_URL}/api/professionals`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ProfesionalesPage() {
  const professionals = await getProfessionals();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfesionalesClient professionals={professionals} />
    </>
  );
}
