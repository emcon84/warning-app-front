import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Vacante } from "../../types";
import VacanteDetailClient from "./VacanteDetailClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://reportesreconquista.com";

async function getVacante(id: string): Promise<Vacante | null> {
  try {
    const res = await fetch(`${API}/api/vacantes/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function truncate(text: string, max: number) {
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + "...";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const vacante = await getVacante(id);
  if (!vacante) return { title: "Vacante no encontrada" };

  const title = `${vacante.titulo} en ${vacante.comercio.nombre} - Reconquista`;
  const description = truncate(vacante.descripcion, 155);
  const image = vacante.comercio.foto || `${SITE_URL}/icon-512x512.png`;
  const canonicalUrl = `${SITE_URL}/vacante/${id}`;

  return {
    title,
    description,
    keywords: [vacante.titulo, vacante.comercio.nombre, ...vacante.habilidades, "empleo", "Reconquista", "Santa Fe"],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Reportes Reconquista",
      url: canonicalUrl,
      images: [{ url: image, width: 400, height: 400, alt: vacante.titulo }],
    },
    twitter: { card: "summary", title, description, images: [image] },
  };
}

export default async function VacanteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vacante = await getVacante(id);
  if (!vacante) notFound();

  return <VacanteDetailClient vacante={vacante} />;
}
