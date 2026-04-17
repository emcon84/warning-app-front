import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfessionalDetail } from "../../types";
import ProfileClient from "./ProfileClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://reportesreconquista.com";

function resolveImage(foto?: string | null): string {
  if (!foto) return `${SITE_URL}/icon-512x512.png`;
  const absolute = foto.startsWith("/uploads/") ? `${SITE_URL}${foto}` : foto;
  return `${SITE_URL}/_next/image?url=${encodeURIComponent(absolute)}&w=1200&q=85`;
}

async function getProfessional(slug: string): Promise<ProfessionalDetail | null> {
  try {
    const res = await fetch(`${API}/api/professionals/${slug}`, { cache: "no-store" });
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
  const pro = await getProfessional(slug);

  if (!pro) {
    return { title: "Profesional no encontrado" };
  }

  const title = `${pro.nombre} ${pro.apellido} | ${pro.oficios[0]} en Reconquista`;

  const rawDescription =
    pro.descripcion ||
    `${pro.oficios.join(", ")} en ${pro.barrio}, Reconquista. ${
      pro.ratingCount > 0
        ? `Calificacion ${pro.ratingAvg.toFixed(1)}/5 con ${pro.ratingCount} opinion${pro.ratingCount !== 1 ? "es" : ""}.`
        : "Registrado en Reportes Reconquista."
    }`;
  const description = truncate(rawDescription, 155);

  const image = resolveImage(pro.foto);
  const canonicalUrl = `${SITE_URL}/profesional/${slug}`;

  return {
    title,
    description,
    keywords: [
      pro.nombre,
      pro.apellido,
      ...pro.oficios,
      "Reconquista",
      "Santa Fe",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: "Reportes Reconquista",
      url: canonicalUrl,
      images: [{ url: image, width: 400, height: 400, alt: `${pro.nombre} ${pro.apellido}` }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [image],
    },
  };
}

function buildJsonLd(pro: ProfessionalDetail, slug: string) {
  const base = {
    "@context": "https://schema.org",
    "@type": ["Person", "LocalBusiness"],
    name: `${pro.nombre} ${pro.apellido}`,
    jobTitle: pro.oficios[0],
    url: `${SITE_URL}/profesional/${slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Reconquista",
      addressRegion: "Santa Fe",
      addressCountry: "AR",
    },
    ...(pro.foto ? { image: pro.foto } : {}),
    ...(pro.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: pro.ratingAvg.toFixed(1),
            reviewCount: pro.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
  return base;
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pro = await getProfessional(slug);
  if (!pro) notFound();

  const jsonLd = buildJsonLd(pro, slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileClient pro={pro} slug={slug} />
    </>
  );
}
