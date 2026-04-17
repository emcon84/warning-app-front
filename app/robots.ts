import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/mi-perfil",
          "/chats",
          "/chat/",
          "/sign-in",
          "/sign-up",
          "/profesional/nuevo",
          "/empleado/nuevo",
          "/empleado/editar",
          "/comercio/nuevo",
          "/vacante/nueva",
          "/chat/nuevo",
          "/settings",
        ],
      },
    ],
    sitemap: "https://reportesreconquista.com/sitemap.xml",
  };
}
