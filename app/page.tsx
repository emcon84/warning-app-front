import type { Metadata } from "next";
import LandingPageContent from "./components/LandingPageContent";

export const metadata: Metadata = {
  title: "App ciudadana para Reconquista, Santa Fe",
  description:
    "La app ciudadana de Reconquista, Santa Fe. Reporta situaciones en la via publica, encuentra medicos IAPOS/PAMI, farmacias de turno, profesionales, comercios y ofertas de supermercados.",
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
    description: "Reporta situaciones urbanas, encuentra medicos IAPOS/PAMI, farmacias de turno, profesionales, comercios y ofertas en Reconquista, Santa Fe.",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reportes Reconquista | App ciudadana para Reconquista, Santa Fe",
    description: "Reporta situaciones urbanas, encuentra medicos IAPOS/PAMI, farmacias de turno, profesionales, comercios y ofertas en Reconquista, Santa Fe.",
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
        { "@type": "ListItem", position: 3, name: "Albañiles en Reconquista", url: "https://reportesreconquista.com/oficios" },
        { "@type": "ListItem", position: 4, name: "Pintores en Reconquista", url: "https://reportesreconquista.com/oficios" },
        { "@type": "ListItem", position: 5, name: "Gasistas en Reconquista", url: "https://reportesreconquista.com/oficios" },
        { "@type": "ListItem", position: 6, name: "Cerrajeros en Reconquista", url: "https://reportesreconquista.com/oficios" },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPageContent />
    </>
  );
}
