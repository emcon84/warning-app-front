import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle, Stethoscope, Pill, Wrench, Store,
  ShoppingCart, ChevronRight, Star, MessageCircle, QrCode, Package, Check, X as XIcon,
} from "lucide-react";
import LandingThemeToggle from "./components/LandingThemeToggle";
import HeroCarousel from "./components/HeroCarousel";

export const metadata: Metadata = {
  title: "Reportes Reconquista | App ciudadana para Reconquista, Santa Fe",
  description:
    "La app ciudadana de Reconquista, Santa Fe. Reporta situaciones en la via publica, encontra medicos IAPOS/PAMI, farmacias de turno, profesionales, comercios y ofertas de supermercados.",
  keywords: [
    "Reconquista", "Santa Fe", "reportes ciudadanos", "baches Reconquista",
    "medicos IAPOS Reconquista", "farmacias turno Reconquista",
    "profesionales Reconquista", "plomeros electricistas Reconquista",
    "ofertas supermercados Reconquista", "app vecinos Reconquista",
    "comercios Reconquista",
  ],
  alternates: { canonical: "https://reportesreconquista.com" },
  openGraph: {
    type: "website",
    url: "https://reportesreconquista.com",
    siteName: "Reportes Reconquista",
    title: "Reportes Reconquista | App ciudadana para Reconquista, Santa Fe",
    description: "Reporta situaciones urbanas, encontra medicos IAPOS/PAMI, farmacias de turno, profesionales, comercios y ofertas en Reconquista, Santa Fe.",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reportes Reconquista | App ciudadana para Reconquista, Santa Fe",
    description: "Reporta situaciones urbanas, encontra medicos IAPOS/PAMI, farmacias de turno, profesionales, comercios y ofertas en Reconquista, Santa Fe.",
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
      description: "Plataforma ciudadana para reportes urbanos, directorio de medicos, farmacias de turno, profesionales y ofertas de supermercados en Reconquista, Santa Fe, Argentina.",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web, Android, iOS",
      offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
      featureList: [
        "Reportes ciudadanos geolocalizados",
        "Directorio de medicos IAPOS y PAMI",
        "Farmacias de turno en tiempo real",
        "Directorio de profesionales y oficios con chat",
        "Vidriera digital de comercios locales",
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
      areaServed: { "@type": "City", name: "Reconquista" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://reportesreconquista.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Dónde encontrar plomeros en Reconquista?",
          acceptedAnswer: { "@type": "Answer", text: "En Reportes Reconquista podés encontrar plomeros en Reconquista, Santa Fe. El directorio en reportesreconquista.com/oficios lista plomeros con perfil verificado, zona de trabajo y contacto directo por chat." },
        },
        {
          "@type": "Question",
          name: "¿Dónde encontrar electricistas en Reconquista?",
          acceptedAnswer: { "@type": "Answer", text: "El directorio de profesionales de Reportes Reconquista incluye electricistas en Reconquista, Santa Fe. Podés contactarlos por chat directamente desde la app." },
        },
        {
          "@type": "Question",
          name: "¿Cuál farmacia está de turno hoy en Reconquista?",
          acceptedAnswer: { "@type": "Answer", text: "Podés ver la farmacia de turno hoy en Reconquista en la sección Farmacias de la app. La información se actualiza diariamente con dirección y teléfono." },
        },
        {
          "@type": "Question",
          name: "¿Cómo encontrar médicos IAPOS en Reconquista?",
          acceptedAnswer: { "@type": "Answer", text: "Reportes Reconquista tiene un directorio completo de médicos IAPOS en Reconquista, Santa Fe, con especialidad, dirección y ubicación en el mapa. También incluye médicos PAMI y otras obras sociales." },
        },
        {
          "@type": "Question",
          name: "¿Cómo reportar un problema urbano en Reconquista?",
          acceptedAnswer: { "@type": "Answer", text: "Desde la app Reportes Reconquista podés marcar en el mapa el bache, inundación, alumbrado roto o pastizal. El reporte queda geolocalizado y visible para vecinos y el municipio." },
        },
        {
          "@type": "Question",
          name: "¿Dónde ver ofertas de supermercados en Reconquista?",
          acceptedAnswer: { "@type": "Answer", text: "Las ofertas y promociones de los supermercados de Reconquista están disponibles en reportesreconquista.com/ofertas. La comunidad actualiza las promociones de los principales supermercados locales." },
        },
      ],
    },
    {
      "@type": "ItemList",
      "@id": "https://reportesreconquista.com/#oficios",
      name: "Profesionales y oficios en Reconquista",
      description: "Directorio de profesionales de oficio en Reconquista, Santa Fe",
      url: "https://reportesreconquista.com/oficios",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Plomeros en Reconquista", url: "https://reportesreconquista.com/oficios" },
        { "@type": "ListItem", position: 2, name: "Electricistas en Reconquista", url: "https://reportesreconquista.com/oficios" },
        { "@type": "ListItem", position: 3, name: "Albaniles en Reconquista", url: "https://reportesreconquista.com/oficios" },
        { "@type": "ListItem", position: 4, name: "Pintores en Reconquista", url: "https://reportesreconquista.com/oficios" },
        { "@type": "ListItem", position: 5, name: "Gasistas en Reconquista", url: "https://reportesreconquista.com/oficios" },
        { "@type": "ListItem", position: 6, name: "Cerrajeros en Reconquista", url: "https://reportesreconquista.com/oficios" },
      ],
    },
  ],
};

const FEATURES = [
  {
    icon: AlertTriangle,
    title: "Reportes ciudadanos",
    description: "Reporta baches, inundaciones, alumbrado roto y situaciones urbanas. Quedan geolocalizados y visibles para todos los vecinos.",
    color: "text-orange-500 dark:text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    href: "/app",
  },
  {
    icon: Stethoscope,
    title: "Medicos IAPOS y PAMI",
    description: "Directorio completo de medicos en Reconquista con especialidad, obra social y ubicacion en el mapa.",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    href: "/medicos",
  },
  {
    icon: Pill,
    title: "Farmacias de turno",
    description: "Sabe cuál farmacia esta de turno hoy en Reconquista. Actualizado diariamente con direccion y telefono.",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    href: "/farmacias",
  },
  {
    icon: Wrench,
    title: "Oficios y Profesionales",
    description: "Plomeros, electricistas, albaniles, contadores, abogados y mas. Contacto directo por chat en tiempo real.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    href: "/oficios",
  },
  {
    icon: Store,
    title: "Comercios locales",
    description: "El directorio de negocios de Reconquista. Encontra lo que necesitas y contacta directamente por WhatsApp.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    href: "/comercios",
  },
  {
    icon: ShoppingCart,
    title: "Ofertas de supermercados",
    description: "Las mejores ofertas y promociones de los supermercados de Reconquista actualizadas por la comunidad.",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    href: "/ofertas",
  },
];

const FAQ = [
  {
    q: "¿Dónde encontrar plomeros en Reconquista?",
    a: "En la sección Oficios encontras plomeros, electricistas, albaniles y mas profesionales con perfil, zona y contacto directo por chat.",
  },
  {
    q: "¿Cuál farmacia está de turno hoy en Reconquista?",
    a: "En la sección Farmacias ves la farmacia de turno de hoy en Reconquista con direccion y telefono. Se actualiza diariamente.",
  },
  {
    q: "¿Cómo reportar un problema en la via pública?",
    a: "Abri la app, tocas el mapa en el punto del problema, elegis el tipo (bache, inundacion, alumbrado...) y el reporte queda visible para vecinos y el municipio.",
  },
  {
    q: "¿Cómo encontrar medicos IAPOS en Reconquista?",
    a: "En la sección Medicos podes filtrar por IAPOS, PAMI u otras obras sociales. Encontras especialidad, direccion y ubicacion en el mapa.",
  },
  {
    q: "¿Como registro mi comercio en la app?",
    a: "En la sección Comercios tocas 'Registrar mi comercio', completas los datos en unos pasos y tu vidriera digital queda visible para toda la ciudad.",
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="Logo" className="w-8 h-8 rounded-xl" />
              <span className="font-black text-gray-900 dark:text-white text-sm hidden sm:block">Reportes Reconquista</span>
            </Link>
            <div className="flex items-center gap-3">
              <LandingThemeToggle />
              <Link
                href="/oficios"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Abrir app
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden pt-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.06)_0%,_transparent_60%)]" />
          <div className="max-w-6xl mx-auto">
            <HeroCarousel />
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-gray-200/60 dark:border-gray-800/60 bg-gray-50 dark:bg-gray-900/30">
          <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-3 gap-4 sm:gap-8 text-center">
            {[
              { value: "500+", label: "Vecinos activos" },
              { value: "1.200+", label: "Reportes publicados" },
              { value: "80+", label: "Profesionales" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-3">Todo en un solo lugar</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">La app que Reconquista necesitaba</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl mx-auto">Seis herramientas esenciales para el dia a dia de los vecinos de Reconquista, Santa Fe.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className={`group relative p-6 rounded-2xl border ${f.bg} hover:scale-[1.02] transition-transform`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.bg}`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{f.description}</p>
                <ChevronRight className={`w-4 h-4 ${f.color} absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity`} />
              </Link>
            ))}
          </div>
        </section>

        {/* Commerce CTA */}
        <section className="border-t border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-br from-amber-50 dark:from-amber-950/30 to-white dark:to-gray-950">
          <div className="max-w-6xl mx-auto px-4 py-20">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Text */}
              <div className="flex-1 max-w-lg">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-5">
                  Para comerciantes
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-5">
                  Tu negocio visible para{" "}
                  <span className="text-amber-500 dark:text-amber-400">toda la ciudad</span>
                </h2>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                  Registra tu comercio en minutos y tene tu vidriera digital gratuita. Foto, descripcion, catalogo de productos, horario y contacto directo por WhatsApp.
                </p>
                <ul className="space-y-2 mb-8">
                  {[
                    "Perfil con foto, descripcion y datos de contacto",
                    "Catalogo de productos con precio y foto",
                    "Aparece en el directorio de comercios de Reconquista",
                    "Kit de QR imprimible para tu vidriera",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/comercio/nuevo"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-2xl transition-colors text-sm"
                  >
                    Registrar mi comercio gratis
                  </Link>
                  <Link
                    href="/para-comercios"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:border-amber-500 font-semibold rounded-2xl transition-colors text-sm"
                  >
                    Saber mas
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              {/* Mini mockup vidriera — stays dark (phone screen) */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-amber-500/10 rounded-3xl blur-3xl" />
                <div className="relative w-72 bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="h-24 bg-gradient-to-br from-amber-900/60 to-gray-900 flex items-end p-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center">
                      <Store className="w-7 h-7 text-amber-400" />
                    </div>
                  </div>
                  <div className="p-4 pb-2">
                    <p className="font-black text-white text-sm">Ferreteria El Tornillo</p>
                    <p className="text-amber-400 text-xs mt-0.5">Ferreteria · Centro</p>
                    <p className="text-gray-500 text-xs mt-2 leading-relaxed">Todo en herramientas, materiales y accesorios para tu hogar y obra.</p>
                  </div>
                  <div className="px-4 pb-4">
                    <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wide mb-2">Catalogo</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: "Taladro 600W", price: "$45.000" },
                        { name: "Cinta metrica 5m", price: "$3.200" },
                        { name: "Pintura látex 4L", price: "$12.500" },
                      ].map((p, i) => (
                        <div key={i} className="bg-gray-800 rounded-xl p-2 text-center">
                          <div className="w-8 h-8 bg-gray-700 rounded-lg mx-auto mb-1 flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-500" />
                          </div>
                          <p className="text-white text-[8px] font-semibold leading-tight">{p.name}</p>
                          <p className="text-amber-400 text-[8px] mt-0.5">{p.price}</p>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-3 py-2 bg-green-500/20 text-green-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Contactar por WhatsApp
                    </button>
                    <div className="mt-2 flex items-center justify-between">
                      <button className="flex items-center gap-1 bg-gray-800 px-2 py-1.5 rounded-lg">
                        <QrCode className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400 text-[8px]">Kit vidriera</span>
                      </button>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-400 text-[8px] font-semibold">4.8</span>
                        <span className="text-gray-600 text-[8px]">(24)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ventajas vs Instagram */}
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 mb-5">
              Para dueños de comercio
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">
              ¿Por qué no alcanza con Instagram?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">
              Las redes sociales son para que te vean. Reportes Reconquista es para que te encuentren cuando alguien necesita exactamente lo que vos vendes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">Solo con Instagram</p>
              <ul className="space-y-4">
                {[
                  "El algoritmo decide quién te ve, y a veces no te ve nadie",
                  "Nadie busca \"ferretería en Reconquista\" en Instagram",
                  "Las publicaciones desaparecen del feed en horas",
                  "Para contactarte: DM, esperar, dar el número, ahí recién WhatsApp",
                  "Tu catálogo son fotos desordenadas mezcladas con todo lo demás",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <XIcon className="w-3 h-3 text-red-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-500/25 p-6 bg-blue-500/5">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-6">Con Reportes Reconquista</p>
              <ul className="space-y-4">
                {[
                  "Aparecés cuando alguien busca lo que vos vendés, sin depender de ningún algoritmo",
                  "Tu perfil está visible 24/7 en el directorio local de Reconquista",
                  "Botón de WhatsApp directo desde tu perfil, un toque y ya están hablando con vos",
                  "Catálogo organizado con fotos y precios, siempre actualizado y siempre visible",
                  "QR imprimible para la vidriera: del local a tu perfil digital en segundos",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-50 dark:from-blue-950/30 to-amber-50 dark:to-amber-950/20 p-8 sm:p-12 text-center">
            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-snug">
              En Instagram la gente{" "}
              <span className="text-purple-600 dark:text-purple-400">pasa el tiempo</span>.<br />
              En Reportes Reconquista la gente{" "}
              <span className="text-blue-600 dark:text-blue-400">busca lo que necesita</span>.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 max-w-lg mx-auto leading-relaxed">
              Quien llega a tu perfil en la app ya está buscando un comercio como el tuyo. Esa intención de compra no existe en ninguna red social.
            </p>
            <Link
              href="/comercio/nuevo"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm transition-colors"
            >
              Registrar mi comercio gratis
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="group bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none text-sm font-semibold text-gray-900 dark:text-white">
                  {item.q}
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="px-5 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Sobre la app — contenido SEO */}
        <section className="border-t border-gray-200/60 dark:border-gray-800/60 bg-gray-50 dark:bg-gray-900/20">
          <div className="max-w-3xl mx-auto px-4 py-16">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
              ¿Qué es Reportes Reconquista?
            </h2>
            <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              <p>
                Reportes Reconquista es la plataforma ciudadana de Reconquista, Santa Fe, Argentina. Permite a los vecinos reportar problemas en la via publica como baches, inundaciones, alumbrado roto y pastizales, geolocalizados en el mapa para que toda la comunidad y el municipio puedan verlos en tiempo real.
              </p>
              <p>
                Ademas del modulo de reportes, la app incluye un directorio completo de medicos IAPOS, PAMI y otras obras sociales en Reconquista; informacion actualizada diariamente sobre farmacias de turno con direccion y telefono; un directorio de profesionales y oficios como plomeros, electricistas, gasistas, pintores y albaniles con contacto directo por chat; y un directorio de comercios locales con vidriera digital, catalogo de productos y contacto directo por WhatsApp.
              </p>
              <p>
                Reportes Reconquista tambien agrega las ofertas de los supermercados de Reconquista actualizadas por la comunidad, funciona como PWA instalable en Android e iOS sin necesidad de descargar nada, y envia notificaciones push para mantenerte al tanto de lo que pasa en tu ciudad. Completamente gratuita para los vecinos y para los comerciantes que quieran registrar su negocio.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200/60 dark:border-gray-800/60">
          <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="Logo" className="w-7 h-7 rounded-xl" />
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Reportes Reconquista</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
              Hecho con amor para los vecinos de Reconquista, Santa Fe, Argentina.
            </p>
            <div className="flex items-center gap-4">
              {[
                { label: "App", href: "/app" },
                { label: "Oficios", href: "/oficios" },
                { label: "Comercios", href: "/comercios" },
                { label: "Farmacias", href: "/farmacias" },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
