import { MetadataRoute } from "next";

const BASE_URL = "https://reportesreconquista.com";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface SlugItem {
  slug: string;
  updatedAt: string;
  activo?: boolean;
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
    {
      url: `${BASE_URL}/app`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  const [profRoutes, empleadoRoutes, comercioRoutes] = await Promise.all([
    // Profesionales
    fetch(`${API}/api/professionals`, { next: { revalidate: 3600 } })
      .then((r) => r.ok ? r.json() : [])
      .then((items: SlugItem[]) =>
        items
          .filter((p) => p.activo !== false)
          .map((p): MetadataRoute.Sitemap[number] => ({
            url: `${BASE_URL}/profesional/${p.slug}`,
            lastModified: new Date(p.updatedAt),
            changeFrequency: "weekly",
            priority: 0.7,
          }))
      )
      .catch(() => [] as MetadataRoute.Sitemap),

    // Empleados/CVs
    fetch(`${API}/api/empleados`, { next: { revalidate: 3600 } })
      .then((r) => r.ok ? r.json() : [])
      .then((items: SlugItem[]) =>
        items
          .filter((e) => e.activo !== false)
          .map((e): MetadataRoute.Sitemap[number] => ({
            url: `${BASE_URL}/empleado/${e.slug}`,
            lastModified: new Date(e.updatedAt),
            changeFrequency: "weekly",
            priority: 0.6,
          }))
      )
      .catch(() => [] as MetadataRoute.Sitemap),

    // Comercios
    fetch(`${API}/api/comercios`, { next: { revalidate: 3600 } })
      .then((r) => r.ok ? r.json() : [])
      .then((items: SlugItem[]) =>
        items
          .filter((c) => c.activo !== false)
          .map((c): MetadataRoute.Sitemap[number] => ({
            url: `${BASE_URL}/comercio/${c.slug}`,
            lastModified: new Date(c.updatedAt),
            changeFrequency: "weekly",
            priority: 0.6,
          }))
      )
      .catch(() => [] as MetadataRoute.Sitemap),
  ]);

  return [...staticRoutes, ...profRoutes, ...empleadoRoutes, ...comercioRoutes];
}
