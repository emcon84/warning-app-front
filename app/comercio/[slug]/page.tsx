import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Comercio } from "../../types";
import ComercioProfileClient from "./ComercioProfileClient";

import { API_URL } from "../../lib/api/client";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://reportesreconquista.com";

/**
 * Resuelve la URL de imagen para og:image.
 * WhatsApp/Twitter no soportan AVIF — se pasa por /_next/image
 * que convierte a JPEG/WebP según el cliente (crawlers reciben JPEG).
 */
function resolveImage(foto?: string | null): string {
  if (!foto) return `${SITE_URL}/icon-512x512.png`;
  const absolute = foto.startsWith("/uploads/") ? `${SITE_URL}${foto}` : foto;
  // Convertir a JPEG via Next.js image optimizer para compatibilidad con crawlers
  return `${SITE_URL}/_next/image?url=${encodeURIComponent(absolute)}&w=1200&q=85`;
}

async function getComercio(slug: string): Promise<Comercio | null> {
  try {
    const res = await fetch(`/api/comercios/${slug}`, { cache: "no-store" });
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
  const comercio = await getComercio(slug);

  if (!comercio) {
    return { title: "Comercio no encontrado" };
  }

  const title = `${comercio.nombre} | ${comercio.rubro} en Reconquista`;
  const rawDescription =
    comercio.descripcion ||
    `${comercio.rubro} en ${comercio.barrio}, Reconquista.${comercio.direccion ? ` ${comercio.direccion}.` : ""} Registrado en Reportes Reconquista.`;
  const description = truncate(rawDescription, 155);
  const image = resolveImage(comercio.foto);
  const canonicalUrl = `${SITE_URL}/comercio/${slug}`;

  return {
    title,
    description,
    keywords: [
      comercio.nombre,
      comercio.rubro,
      comercio.barrio,
      "Reconquista",
      "Santa Fe",
      `${comercio.rubro} Reconquista`,
      `comercios Reconquista`,
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Reportes Reconquista",
      url: canonicalUrl,
      locale: "es_AR",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${comercio.nombre} — ${comercio.rubro} en Reconquista`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

function buildJsonLd(comercio: Comercio, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: comercio.nombre,
    description: comercio.descripcion || undefined,
    url: `${SITE_URL}/comercio/${slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: comercio.direccion || undefined,
      addressLocality: "Reconquista",
      addressRegion: "Santa Fe",
      addressCountry: "AR",
    },
    ...(comercio.whatsapp ? { telephone: `+${comercio.whatsapp}` } : {}),
    ...(comercio.foto ? { image: comercio.foto } : {}),
    ...(comercio.horario ? { openingHours: comercio.horario } : {}),
  };
}

async function checkIsOwner(slug: string): Promise<boolean> {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    if (!token) return false;
    const res = await fetch(`/api/comercios/me`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const mine = await res.json();
    return mine.slug === slug;
  } catch {
    return false;
  }
}

export default async function ComercioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [comercio, isOwner] = await Promise.all([
    getComercio(slug),
    checkIsOwner(slug),
  ]);
  if (!comercio) notFound();

  const jsonLd = buildJsonLd(comercio, slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ComercioProfileClient comercio={comercio} isOwner={isOwner} />
    </>
  );
}
