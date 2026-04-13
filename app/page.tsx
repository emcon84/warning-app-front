import type { Metadata } from "next";
import Link from "next/link";
import {
  Map,
  AlertTriangle,
  Stethoscope,
  Pill,
  ShoppingCart,
  Wrench,
  MessageCircle,
  ChevronRight,
  MapPin,
  Users,
  Bell,
  CheckCircle,
} from "lucide-react";
import LandingThemeToggle from "./components/LandingThemeToggle";

export const metadata: Metadata = {
  title: "Reportes Reconquista | App ciudadana para Reconquista, Santa Fe",
  description:
    "La app ciudadana de Reconquista, Santa Fe. Reportá baches, inundaciones y problemas urbanos. Encontrá médicos IAPOS/PAMI, farmacias de turno, profesionales y ofertas de supermercados.",
  keywords: [
    "Reconquista",
    "Santa Fe",
    "reportes ciudadanos",
    "baches Reconquista",
    "médicos IAPOS Reconquista",
    "farmacias turno Reconquista",
    "profesionales Reconquista",
    "plomeros electricistas Reconquista",
    "ofertas supermercados Reconquista",
    "app vecinos Reconquista",
  ],
  alternates: {
    canonical: "https://reportesreconquista.com",
  },
  openGraph: {
    type: "website",
    url: "https://reportesreconquista.com",
    siteName: "Reportes Reconquista",
    title: "Reportes Reconquista | App ciudadana para Reconquista, Santa Fe",
    description:
      "Reportá baches, encontrá médicos IAPOS/PAMI, farmacias de turno, profesionales y ofertas en Reconquista, Santa Fe.",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reportes Reconquista | App ciudadana para Reconquista, Santa Fe",
    description:
      "Reportá baches, encontrá médicos IAPOS/PAMI, farmacias de turno, profesionales y ofertas en Reconquista, Santa Fe.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://reportesreconquista.com/#app",
      name: "Reportes Reconquista",
      url: "https://reportesreconquista.com",
      description:
        "Plataforma ciudadana para reportes urbanos, directorio de médicos, farmacias de turno, profesionales y ofertas de supermercados en Reconquista, Santa Fe, Argentina.",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web, Android, iOS",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "ARS",
      },
      featureList: [
        "Reportes ciudadanos geolocalizados",
        "Directorio de médicos IAPOS y PAMI",
        "Farmacias de turno en tiempo real",
        "Directorio de profesionales y oficios con chat",
        "Ofertas de supermercados locales",
        "Notificaciones push",
        "PWA instalable",
      ],
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://reportesreconquista.com/#business",
      name: "Reportes Reconquista",
      url: "https://reportesreconquista.com",
      description: "Plataforma de servicios ciudadanos para Reconquista, Santa Fe.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Reconquista",
        addressRegion: "Santa Fe",
        addressCountry: "AR",
      },
      areaServed: {
        "@type": "City",
        name: "Reconquista",
      },
    },
  ],
};

const features = [
  {
    icon: AlertTriangle,
    title: "Reportes ciudadanos",
    description:
      "Reportá baches, inundaciones, alumbrado roto o pastizales en el mapa interactivo de Reconquista. Los reportes quedan geolocalizados para que el municipio y los vecinos los vean.",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    icon: Stethoscope,
    title: "Médicos IAPOS y PAMI",
    description:
      "Directorio completo de médicos en Reconquista con especialidad, obra social y ubicación en el mapa. Filtrá por IAPOS, PAMI o especialidad.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Pill,
    title: "Farmacias de turno",
    description:
      "Sabé cuál farmacia está de turno hoy en Reconquista, Santa Fe. Información actualizada diariamente con dirección y teléfono.",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  {
    icon: Wrench,
    title: "Profesionales y oficios",
    description:
      "Encontrá plomeros, electricistas, albañiles, pintores y más profesionales de Reconquista. Contactalos por chat en tiempo real directamente desde la app.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: ShoppingCart,
    title: "Ofertas de supermercados",
    description:
      "Las mejores ofertas y promociones de los supermercados de Reconquista en un solo lugar. Ahorrá en tus compras del día a día.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
];

const steps = [
  {
    number: "01",
    icon: Map,
    title: "Abrí el mapa",
    description:
      "Accedé al mapa interactivo de Reconquista y visualizá reportes ciudadanos, médicos y farmacias en tiempo real.",
  },
  {
    number: "02",
    icon: AlertTriangle,
    title: "Reportá un problema",
    description:
      "Tocá cualquier punto del mapa para reportar un bache, inundación o problema urbano en tu barrio de Reconquista.",
  },
  {
    number: "03",
    icon: Users,
    title: "Encontrá servicios",
    description:
      "Buscá médicos por especialidad y obra social, farmacias de turno, o contratá un profesional de Reconquista vía chat.",
  },
];

const trades = [
  "Plomeros",
  "Electricistas",
  "Albañiles",
  "Pintores",
  "Cerrajeros",
  "Gasistas",
  "Técnicos",
  "Jardineros",
];

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen dark:bg-gray-950 bg-white dark:text-white text-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 dark:bg-gray-950/90 bg-white/90 backdrop-blur-md border-b dark:border-gray-800 border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/icon.svg" className="w-8 h-8" alt="Reportes Reconquista" />
              <span className="font-bold dark:text-white text-gray-900 text-sm">Reportes Reconquista</span>
            </div>
            <div className="flex items-center gap-2">
              <LandingThemeToggle />
              <Link
                href="/app"
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors sm:text-sm sm:px-4 sm:py-2 sm:gap-1.5"
              >
                Abrir app
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Gradiente de fondo */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.15) 0%, rgba(99,102,241,0.08) 50%, transparent 100%)",
            }}
          />

          <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-24 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-500 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <MapPin className="w-3.5 h-3.5" />
              Reconquista, Santa Fe, Argentina
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight dark:text-white text-gray-900">
              La app ciudadana de{" "}
              <span className="text-blue-500">Reconquista</span>
            </h1>

            <p className="dark:text-gray-400 text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Reportá baches e inundaciones, encontrá médicos IAPOS y PAMI,
              consultá las farmacias de turno, contratá profesionales y seguí las
              ofertas de supermercados. Todo para los vecinos de{" "}
              <strong className="dark:text-gray-200 text-gray-800">Reconquista, Santa Fe</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/profesionales"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:shadow-lg hover:shadow-indigo-600/25"
              >
                Encontrá un profesional
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/app"
                className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold px-6 py-4 rounded-2xl text-base transition-colors"
              >
                Ver el mapa
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats visuales */}
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mt-14">
              {[
                { label: "Reportes activos", value: "Mapa en vivo" },
                { label: "Médicos registrados", value: "IAPOS · PAMI" },
                { label: "Profesionales", value: "Con chat" },
              ].map((stat) => (
                <div key={stat.label} className="dark:bg-gray-900 bg-gray-100 dark:border-gray-800 border border-gray-200 rounded-xl p-3 text-center">
                  <p className="text-blue-500 font-bold text-xs">{stat.value}</p>
                  <p className="dark:text-gray-500 text-gray-500 text-[10px] mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 dark:text-white text-gray-900">
              Todo lo que necesitás en Reconquista
            </h2>
            <p className="dark:text-gray-400 text-gray-600 text-lg max-w-xl mx-auto">
              Una plataforma pensada para los vecinos de Reconquista, Santa Fe.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className={`dark:bg-gray-900 bg-gray-100 border rounded-2xl p-6 flex flex-col gap-3 ${f.bg}`}
              >
                <div className={`w-10 h-10 rounded-xl dark:bg-gray-800 bg-white flex items-center justify-center ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold dark:text-white text-gray-900 text-lg">{f.title}</h3>
                <p className="dark:text-gray-400 text-gray-600 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="dark:bg-gray-900 bg-gray-50 dark:border-gray-800 border-gray-200 border-y py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 dark:text-white text-gray-900">
                Tres pasos, sin vueltas
              </h2>
              <p className="dark:text-gray-400 text-gray-600 text-lg max-w-xl mx-auto">
                Reportes ciudadanos en Reconquista nunca fue tan fácil.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.number} className="relative flex flex-col items-center text-center gap-4">
                  {/* Línea conectora */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] right-0 h-px dark:bg-gray-700 bg-gray-300" />
                  )}
                  <div className="w-16 h-16 rounded-2xl dark:bg-gray-800 bg-white dark:border-gray-700 border border-gray-200 flex items-center justify-center flex-shrink-0 relative">
                    <step.icon className="w-7 h-7 text-blue-500" />
                    <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
                      {step.number.replace("0", "")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold dark:text-white text-gray-900 text-lg mb-2">{step.title}</h3>
                    <p className="dark:text-gray-400 text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Oficios highlight */}
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="dark:bg-gray-900 bg-gray-50 border border-indigo-500/20 rounded-3xl p-8 sm:p-12">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-indigo-400 font-semibold text-sm">Directorio de profesionales</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 dark:text-white text-gray-900">
                  Encontrá el profesional que necesitás en{" "}
                  <span className="text-indigo-400">Reconquista</span>
                </h2>
                <p className="dark:text-gray-400 text-gray-600 text-lg leading-relaxed mb-6">
                  Plomeros, electricistas, albañiles y decenas de rubros más.
                  Los vecinos de Reconquista, Santa Fe, pueden contactar
                  directamente a los profesionales por{" "}
                  <strong className="dark:text-white text-gray-900">chat en tiempo real</strong>,
                  sin intermediarios ni comisiones.
                </p>
                <div className="flex items-center gap-2 dark:text-gray-400 text-gray-600 text-sm">
                  <MessageCircle className="w-4 h-4 text-indigo-400" />
                  Chat en tiempo real incluido
                </div>
                <div className="flex items-center gap-2 dark:text-gray-400 text-gray-600 text-sm mt-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Perfiles verificados con reseñas
                </div>
                <div className="flex items-center gap-2 dark:text-gray-400 text-gray-600 text-sm mt-2">
                  <Bell className="w-4 h-4 text-yellow-400" />
                  Notificaciones de respuesta
                </div>
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 mt-8 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  Explorar profesionales
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex-shrink-0 w-full md:w-64">
                <p className="text-xs font-semibold dark:text-gray-500 text-gray-500 uppercase tracking-widest mb-3">
                  Rubros disponibles
                </p>
                <div className="flex flex-wrap gap-2">
                  {trades.map((trade) => (
                    <span
                      key={trade}
                      className="dark:bg-gray-800 bg-white dark:border-gray-700 border border-gray-200 dark:text-gray-300 text-gray-700 text-sm px-3 py-1.5 rounded-full"
                    >
                      {trade}
                    </span>
                  ))}
                  <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm px-3 py-1.5 rounded-full">
                    y muchos más...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="dark:bg-gray-900 bg-gray-50 dark:border-gray-800 border-gray-200 border-t py-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto mb-6">
              <img src="/icon.svg" className="w-10 h-10" alt="Reportes Reconquista" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 dark:text-white text-gray-900">
              Empezá ahora, es gratis
            </h2>
            <p className="dark:text-gray-400 text-gray-600 text-lg mb-8">
              Unite a los vecinos de{" "}
              <strong className="dark:text-white text-gray-900">Reconquista, Santa Fe</strong> que
              ya usan la app para mejorar la ciudad, encontrar médicos y
              contratar profesionales de confianza.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-all hover:shadow-lg hover:shadow-blue-600/25"
            >
              Abrir Reportes Reconquista
              <ChevronRight className="w-5 h-5" />
            </Link>
            <p className="dark:text-gray-600 text-gray-400 text-xs mt-4">
              PWA instalable en tu celular, sin descarga de tienda
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="dark:border-gray-800 border-gray-200 border-t py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/icon.svg" className="w-6 h-6" alt="Reportes Reconquista" />
              <span className="dark:text-gray-400 text-gray-500 text-sm">
                Reportes Reconquista · Reconquista, Santa Fe, Argentina
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm dark:text-gray-500 text-gray-500">
              <Link href="/app" className="dark:hover:text-gray-300 hover:text-gray-700 transition-colors">
                Abrir la app
              </Link>
              <Link href="/profesionales" className="dark:hover:text-gray-300 hover:text-gray-700 transition-colors">
                Profesionales
              </Link>
              <Link href="/ofertas" className="dark:hover:text-gray-300 hover:text-gray-700 transition-colors">
                Ofertas
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
