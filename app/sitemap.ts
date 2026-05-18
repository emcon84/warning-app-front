import { MetadataRoute } from "next";
import { API_URL } from "./lib/api/client";

const BASE_URL = "https://reportesreconquista.com";
const API = API_URL;

interface SlugItem {
  slug: string;
  updatedAt?: string | null;
  activo?: boolean;
}

function safeDate(val: string | null | undefined): Date {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
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
            lastModified: safeDate(p.updatedAt),
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
            url: `${BASE_URL}/empleo/${e.slug}`,
            lastModified: safeDate(e.updatedAt),
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
            lastModified: safeDate(c.updatedAt),
            changeFrequency: "weekly",
            priority: 0.6,
          }))
      )
      .catch(() => [] as MetadataRoute.Sitemap),
  ]);

  return [...staticRoutes, ...profRoutes, ...empleadoRoutes, ...comercioRoutes];
}
