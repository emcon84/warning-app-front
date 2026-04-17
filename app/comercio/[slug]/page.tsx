import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Comercio } from "../../types";
import ComercioProfileClient from "./ComercioProfileClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://reportesreconquista.com";

/** Convierte rutas relativas de uploads a URLs absolutas para OG tags */
function resolveImage(foto?: string | null): string {
  if (!foto) return `${SITE_URL}/icon-512x512.png`;
  if (foto.startsWith("/uploads/")) return `${API}${foto}`;
  return foto;
}

async function getComercio(slug: string): Promise<Comercio | null> {
  try {
    const res = await fetch(`${API}/api/comercios/${slug}`, { cache: "no-store" });
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

export default async function ComercioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comercio = await getComercio(slug);
  if (!comercio) notFound();

  const jsonLd = buildJsonLd(comercio, slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ComercioProfileClient comercio={comercio} />
    </>
  );
}
