import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Empleado } from "@/types";
import EmpleadoProfileClient from "./EmpleadoProfileClient";

import { API_URL } from "@/lib/api/client";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://reportesreconquista.com";

async function getEmpleado(slug: string): Promise<Empleado | null> {
  try {
    const res = await fetch(`${API_URL}/api/empleados/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "...";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const empleado = await getEmpleado(slug);
  if (!empleado) return { title: "Perfil no encontrado" };

  const title = `${empleado.nombre} ${empleado.apellido} | ${empleado.habilidades[0]} - Reconquista`;
  const rawDescription =
    empleado.descripcion ||
    `${empleado.habilidades.join(", ")} en ${empleado.barrio ?? "Reconquista"}, Santa Fe.`;
  const description = truncate(rawDescription, 155);
  const image = empleado.foto || `${SITE_URL}/icon-512x512.png`;
  const canonicalUrl = `${SITE_URL}/empleo/${slug}`;

  return {
    title,
    description,
    keywords: [empleado.nombre, empleado.apellido, ...empleado.habilidades, "Reconquista", "Santa Fe", "empleo"],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: "Reportes Reconquista",
      url: canonicalUrl,
      images: [{ url: image, width: 400, height: 400, alt: `${empleado.nombre} ${empleado.apellido}` }],
    },
    twitter: { card: "summary", title, description, images: [image] },
  };
}

export default async function EmpleadoProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const empleado = await getEmpleado(slug);
  if (!empleado) notFound();

  return <EmpleadoProfileClient empleado={empleado} slug={slug} />;
}
