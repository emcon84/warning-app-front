import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        // Share routes generate dynamic images — never cache them
        urlPattern: /^\/share\//,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: "NetworkOnly" as any,
      },
    ],
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "reportesreconquista.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "pub-8320ee04bdb94df59332be35269b2a51.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.reconquistahoy.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "reconquistahoy.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.reconquista.com.ar",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "reconquista.com.ar",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.vialibre.ar",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "blogger.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bp.blogspot.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/empleado/:path*",
        destination: "/empleo/:path*",
        permanent: true, // 301 — mantiene SEO juice
      },
    ];
  },
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
