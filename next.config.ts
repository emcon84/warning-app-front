import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    // Cachear respuestas GET de la API con StaleWhileRevalidate:
    // sirve desde caché inmediatamente y revalida en background.
    // Esto iguala el comportamiento de Chrome con el de Vivaldi/PWA instalada.
    runtimeCaching: [
      {
        urlPattern: /\/api\/(reports|doctors|farmacias|health|stats|offers|supermarkets|profesionales|comercios)(\?.*)?$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "api-get-cache",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 60 * 60, // 1 hora
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // microphone=(self) permite usar el mic en el propio dominio
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
