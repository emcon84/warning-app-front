import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import NotificationPrompt from "./components/NotificationPrompt";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Reportes Ciudadanos - Reconquista",
  description:
    "Sistema de reportes ciudadanos para Reconquista, Santa Fe. Reportá problemas de basura, alumbrado, baches y pastizales.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Reportes RQ",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Reportes Ciudadanos Reconquista",
    title: "Reportes Ciudadanos - Reconquista",
    description: "Sistema de reportes ciudadanos para Reconquista, Santa Fe",
  },
  twitter: {
    card: "summary",
    title: "Reportes Ciudadanos - Reconquista",
    description: "Sistema de reportes ciudadanos para Reconquista, Santa Fe",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
      variables: {
        colorBackground: "#111827",
        colorInputBackground: "#1f2937",
        colorText: "#ffffff",
        colorTextSecondary: "#e5e7eb",
        colorInputText: "#f9fafb",
        colorPrimary: "#6366f1",
        colorNeutral: "#ffffff",
      },
    }}>
      <html lang="es">
        <head>
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/icon-192x192.png" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}>
          {children}
          <NotificationPrompt />
        </body>
      </html>
    </ClerkProvider>
  );
}
