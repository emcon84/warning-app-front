import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/mi-perfil", "/chat"],
    },
    sitemap: "https://reportesreconquista.com/sitemap.xml",
  };
}
