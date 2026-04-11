import { MetadataRoute } from "next";

const BASE_URL = "https://reportesreconquista.com";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ProfessionalSlug {
  slug: string;
  updatedAt: string;
  activo: boolean;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/profesionales`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/ofertas`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(`${API}/api/professionals`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const professionals: ProfessionalSlug[] = await res.json();
      dynamicRoutes = professionals
        .filter((p) => p.activo)
        .map((p) => ({
          url: `${BASE_URL}/profesional/${p.slug}`,
          lastModified: new Date(p.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
    }
  } catch {
    // Si la API no responde en build time, no bloqueamos el sitemap
  }

  return [...staticRoutes, ...dynamicRoutes];
}
