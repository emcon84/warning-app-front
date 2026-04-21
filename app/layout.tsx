import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import NotificationPrompt from "./components/NotificationPrompt";
import ApiStatusBanner from "./components/ApiStatusBanner";
import MobileBottomNav from "./components/MobileBottomNav";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import PWARedirect from "./components/PWARedirect";
import PostLoginWizard from "./components/PostLoginWizard";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./contexts/ThemeContext";
import { dark } from "@clerk/themes";
import { esES } from "@clerk/localizations";

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
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Reportes Reconquista | App ciudadana de Reconquista, Santa Fe",
    template: "%s | Reportes Reconquista",
  },
  description:
    "La plataforma ciudadana de Reconquista, Santa Fe. Encontrá plomeros, electricistas y profesionales; médicos IAPOS y PAMI; farmacias de turno; ofertas de supermercados. Reportá baches e inundaciones.",
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
    siteName: "Reportes Reconquista",
    title: "Reportes Reconquista | App ciudadana de Reconquista, Santa Fe",
    description:
      "Plomeros, electricistas, médicos IAPOS/PAMI, farmacias de turno y ofertas de supermercados en Reconquista, Santa Fe.",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reportes Reconquista | App ciudadana de Reconquista, Santa Fe",
    description:
      "Plomeros, electricistas, médicos IAPOS/PAMI, farmacias de turno y ofertas de supermercados en Reconquista, Santa Fe.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES} appearance={{
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
      elements: {
        userPreviewMainIdentifier: { color: "#ffffff", fontWeight: "600" },
        userPreviewSecondaryIdentifier: { color: "#e5e7eb" },
        userButtonPopoverActionButton__manageAccount: { color: "#ffffff" },
        userButtonPopoverActionButtonText: { color: "#ffffff" },
        userButtonPopoverFooter: { display: "none" },
        formFieldLabel: { color: "#e5e7eb" },
        formFieldInput: { color: "#f9fafb", backgroundColor: "#1f2937", borderColor: "#374151" },
        headerTitle: { color: "#ffffff" },
        headerSubtitle: { color: "#d1d5db" },
        identityPreviewText: { color: "#e5e7eb" },
        formResendCodeLink: { color: "#818cf8" },
        footerActionLink: { color: "#818cf8" },
        dividerText: { color: "#9ca3af" },
        otpCodeFieldInput: { color: "#f9fafb", backgroundColor: "#1f2937", borderColor: "#4f46e5" },
      },
    }}>
      <html lang="es" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/icon-192x192.png" />
          {/* Previene flash de modo claro: aplica .dark antes de que React hidrate */}
          <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':true;if(d)document.documentElement.classList.add('dark');}catch(e){}})();` }} />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} font-sans antialiased`}>
          <ApiStatusBanner />
          <PWARedirect />
          <ThemeProvider>{children}</ThemeProvider>
          <PostLoginWizard />
          <MobileBottomNav />
          <NotificationPrompt />
          <PWAInstallPrompt />
        </body>
      </html>
    </ClerkProvider>
  );
}
