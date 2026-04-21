import type { Metadata } from "next";
import Link from "next/link";
import {
  Store,
  QrCode,
  ChevronRight,
  CheckCircle,
  MessageCircle,
  Download,
  MapPin,
  Tag,
  Smartphone,
} from "lucide-react";
import LandingThemeToggle from "../components/LandingThemeToggle";

export const metadata: Metadata = {
  title: "Registrá tu comercio en Reconquista gratis | Reportes Reconquista",
  description:
    "Vidriera digital gratuita para tu negocio en Reconquista, Santa Fe. Catálogo de productos, ofertas, contacto por WhatsApp y cartel con QR para imprimir. Sin comisiones.",
  keywords: [
    "registrar comercio Reconquista",
    "vidriera digital Reconquista",
    "comercios Reconquista Santa Fe",
    "QR comercio Reconquista",
    "directorio comercios Reconquista",
  ],
  alternates: {
    canonical: "https://reportesreconquista.com/para-comercios",
  },
  openGraph: {
    type: "website",
    url: "https://reportesreconquista.com/para-comercios",
    title: "Registrá tu comercio gratis en Reconquista",
    description:
      "Vidriera digital gratuita para comercios de Reconquista, Santa Fe. Catálogo, ofertas, QR para vidriera y contacto directo con tus clientes.",
    locale: "es_AR",
  },
};

const benefits = [
  {
    icon: Smartphone,
    title: "Tu vitrina digital",
    description:
      "Perfil público con fotos, descripción, horario y dirección. Tus clientes te encuentran aunque estés cerrado.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: QrCode,
    title: "Cartel con QR para tu vidriera",
    description:
      "Descargá un cartel A5 listo para imprimir con tu QR personalizado. Tus clientes lo escanean y ven tu catálogo al instante.",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  {
    icon: MessageCircle,
    title: "Contacto directo por WhatsApp",
    description:
      "Tus clientes te escriben con un toque. Sin intermediarios ni comisiones. El dinero es tuyo.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Tag,
    title: "Catálogo y ofertas actualizadas",
    description:
      "Subí productos, precios y promociones desde tu celular. Tus clientes ven todo en tiempo real.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
];

const steps = [
  {
    n: "1",
    title: "Registrate gratis en 5 minutos",
    description:
      "Completá el formulario con el nombre, rubro, barrio y WhatsApp de tu comercio. Sin tarjeta, sin compromisos.",
  },
  {
    n: "2",
    title: "Cargá tu catálogo",
    description:
      "Subí fotos, productos, servicios y ofertas desde tu perfil. Podés actualizar cuando quieras.",
  },
  {
    n: "3",
    title: "Imprimí tu cartel de vidriera",
    description:
      "Desde tu dashboard descargás el cartel A5 con tu QR personalizado. Lo imprimís y lo pegás en tu local.",
  },
];

const rubros = [
  "Almacenes",
  "Restaurantes",
  "Panaderías",
  "Peluquerías",
  "Ferreterías",
  "Kioscos",
  "Ropa y Calzado",
  "Electrónica",
  "Veterinarias",
  "Farmacias",
  "Muebles",
  "Automotriz",
  "Librerías",
  "Deportes",
];

export default function ParaComerciosPage() {
  return (
    <div className="min-h-screen dark:bg-gray-950 bg-white dark:text-white text-gray-900">

      {/* Header */}
      <header className="sticky top-0 z-50 dark:bg-gray-950/90 bg-white/90 backdrop-blur-md border-b dark:border-gray-800 border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" className="w-8 h-8" alt="Reportes Reconquista" />
            <span className="font-bold dark:text-white text-gray-900 text-sm">Reportes Reconquista</span>
          </Link>
          <div className="flex items-center gap-2">
            <LandingThemeToggle />
            <Link
              href="/comercio/nuevo"
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors sm:text-sm sm:px-4 sm:py-2 sm:gap-1.5"
            >
              Registrar mi comercio
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.15) 0%, rgba(16,185,129,0.08) 50%, transparent 100%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-500 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <MapPin className="w-3.5 h-3.5" />
                Para comercios de Reconquista, Santa Fe
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight dark:text-white text-gray-900">
                Tu negocio en Reconquista,{" "}
                <span className="text-blue-500">en línea y en la vidriera</span>
              </h1>

              <p className="dark:text-gray-400 text-gray-600 text-lg sm:text-xl max-w-xl mb-4 leading-relaxed">
                Vidriera digital gratuita con catálogo, ofertas y contacto por WhatsApp. Más un cartel con QR para poner en tu local.
              </p>

              <p className="dark:text-gray-500 text-gray-500 text-base mb-10">
                Listo en <strong className="dark:text-white text-gray-900">5 minutos</strong>. Sin costo. Sin comisiones.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
                <Link
                  href="/comercio/nuevo"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:shadow-lg hover:shadow-blue-600/25"
                >
                  Registrar mi comercio gratis
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-5 flex-wrap">
                {[
                  "100% gratuito",
                  "Sin comisiones",
                  "Cartel con QR incluido",
                ].map((label) => (
                  <div key={label} className="flex items-center gap-2 text-sm dark:text-gray-400 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Flyer mockup */}
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full" />

              <div
                className="relative w-56 rounded-2xl overflow-hidden shadow-2xl border dark:border-white/10 border-gray-200"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                <div className="bg-blue-600 px-5 py-6 text-center">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 overflow-hidden bg-white/10 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icon.svg" alt="Logo" className="w-10 h-10" />
                  </div>
                  <p className="text-white font-bold text-sm">Reportes Reconquista</p>
                  <p className="text-blue-200 text-xs mt-0.5">Directorio de Comercios</p>
                </div>

                <div className="bg-white px-4 py-5 text-center">
                  <p className="font-black text-gray-900 text-base leading-tight">Tu Comercio</p>
                  <p className="text-gray-500 text-xs mt-1">Rubro · Barrio</p>
                  <p className="text-blue-600 font-bold text-xs mt-3 leading-snug">
                    Escaneá para ver nuestros<br />precios y catálogo actualizado
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="w-28 h-28 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-gray-800" />
                    </div>
                  </div>
                  <p className="text-gray-300 text-xs mt-3">reportesreconquista.com</p>
                </div>
              </div>

              <div className="absolute -bottom-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <Download className="w-3 h-3" />
                Descargable
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 dark:text-white text-gray-900">
            Todo lo que obtenés, gratis
          </h2>
          <p className="dark:text-gray-400 text-gray-600 text-lg max-w-xl mx-auto">
            Un kit digital completo para que tu comercio llegue a más clientes en Reconquista.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className={`dark:bg-gray-900 bg-gray-100 border rounded-2xl p-6 flex gap-4 ${b.bg}`}
            >
              <div className={`w-10 h-10 rounded-xl dark:bg-gray-800 bg-white flex items-center justify-center flex-shrink-0 ${b.color}`}>
                <b.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold dark:text-white text-gray-900 text-base mb-1">{b.title}</h3>
                <p className="dark:text-gray-400 text-gray-600 text-sm leading-relaxed">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kit de Digitalización */}
      <section className="dark:bg-gray-900 bg-gray-50 dark:border-gray-800 border-gray-200 border-y py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <Download className="w-3.5 h-3.5" />
                Incluido en el registro
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 dark:text-white text-gray-900">
                Tu cartel de vidriera,{" "}
                <span className="text-green-500">listo para imprimir</span>
              </h2>
              <p className="dark:text-gray-400 text-gray-600 text-lg leading-relaxed mb-6">
                Registrarse genera tu cartel A5 personalizado con QR. Lo imprimís, lo pegás en tu vidriera, y cada cliente que lo escanea ve tu catálogo actualizado al momento.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "QR vinculado a tu perfil digital",
                  "Diseño profesional listo para imprimir",
                  "Formato A5, ideal para vidrieras",
                  "El QR siempre muestra tu catálogo actualizado",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm dark:text-gray-300 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <Link
                href="/comercio/nuevo"
                className="inline-flex items-center gap-2 mt-8 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Registrarme y obtener mi kit
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mockup detallado */}
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full" />
              <div className="relative dark:bg-gray-800 bg-white rounded-3xl p-6 shadow-2xl dark:border-gray-700 border border-gray-200">
                <p className="text-xs font-semibold dark:text-gray-500 text-gray-400 uppercase tracking-widest mb-4 text-center">
                  Kit de Digitalización
                </p>

                <div
                  className="w-52 mx-auto rounded-xl overflow-hidden shadow-xl"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  <div className="bg-blue-600 px-5 py-6 text-center">
                    <div className="w-11 h-11 rounded-xl mx-auto mb-3 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icon.svg" alt="Logo" className="w-full h-full" />
                    </div>
                    <p className="text-white font-bold text-sm">Reportes Reconquista</p>
                    <p className="text-blue-200" style={{ fontSize: "10px", marginTop: 2 }}>
                      Directorio de Comercios Locales
                    </p>
                  </div>
                  <div className="bg-white px-4 py-5 text-center">
                    <p className="font-black text-gray-900 text-base">Fiambrería Don Luis</p>
                    <p className="text-gray-500 text-xs mt-1">Almacén · Centro</p>
                    <p className="text-blue-600 font-bold text-xs mt-3 leading-snug">
                      Escaneá para ver nuestros<br />precios y catálogo actualizado
                    </p>
                    <div className="mt-4 flex justify-center">
                      <div className="w-28 h-28 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
                        <QrCode className="w-20 h-20 text-gray-800" />
                      </div>
                    </div>
                    <p className="text-gray-300 text-xs mt-3">reportesreconquista.com</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs dark:text-gray-400 text-gray-500">
                  <Download className="w-3.5 h-3.5" />
                  PDF A5 · descarga con 1 click desde tu dashboard
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 dark:text-white text-gray-900">
            En 3 pasos, tu comercio online
          </h2>
          <p className="dark:text-gray-400 text-gray-600 text-lg max-w-xl mx-auto">
            Sin conocimientos técnicos. Sin costo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.n} className="relative flex flex-col items-center text-center gap-4">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] right-0 h-px dark:bg-gray-700 bg-gray-300" />
              )}
              <div className="w-16 h-16 rounded-2xl dark:bg-gray-800 bg-white dark:border-gray-700 border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-2xl font-black text-blue-500">{step.n}</span>
              </div>
              <div>
                <h3 className="font-bold dark:text-white text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="dark:text-gray-400 text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rubros */}
      <section className="dark:bg-gray-900 bg-gray-50 dark:border-gray-800 border-gray-200 border-y py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 dark:text-white text-gray-900">
            ¿Tu negocio entra acá?
          </h2>
          <p className="dark:text-gray-400 text-gray-600 text-base mb-8">
            Cualquier comercio de Reconquista puede registrarse, sin importar el rubro.
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {rubros.map((r) => (
              <span
                key={r}
                className="dark:bg-gray-800 bg-white dark:border-gray-700 border border-gray-200 dark:text-gray-300 text-gray-700 text-sm px-3 py-1.5 rounded-full"
              >
                {r}
              </span>
            ))}
            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm px-3 py-1.5 rounded-full">
              y cualquier otro rubro...
            </span>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 dark:text-white text-gray-900">
            Registrá tu comercio hoy
          </h2>
          <p className="dark:text-gray-400 text-gray-600 text-lg mb-8 leading-relaxed">
            Gratuito, sin comisiones. En 5 minutos tu comercio está en línea y tu cartel con QR listo para imprimir.
          </p>
          <Link
            href="/comercio/nuevo"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-all hover:shadow-lg hover:shadow-blue-600/25"
          >
            Empezar ahora, es gratis
            <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="dark:text-gray-600 text-gray-400 text-xs mt-4">
            Comercios de Reconquista ya tienen su vidriera digital.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="dark:border-gray-800 border-gray-200 border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" className="w-6 h-6" alt="Reportes Reconquista" />
            <span className="dark:text-gray-400 text-gray-500 text-sm">
              Reportes Reconquista · Reconquista, Santa Fe, Argentina
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm dark:text-gray-500 text-gray-500">
            <Link href="/" className="dark:hover:text-gray-300 hover:text-gray-700 transition-colors">
              Inicio
            </Link>
            <Link href="/comercios" className="dark:hover:text-gray-300 hover:text-gray-700 transition-colors">
              Ver comercios
            </Link>
            <Link href="/comercio/nuevo" className="dark:hover:text-gray-300 hover:text-gray-700 transition-colors">
              Registrar comercio
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
