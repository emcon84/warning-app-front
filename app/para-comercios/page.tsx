import type { Metadata } from "next";
import Link from "next/link";
import {
  Store, ChevronRight, QrCode, Star, MessageCircle,
  Package, MapPin, Phone, Clock, Tag,
  BarChart3, Users, Smartphone, Check,
} from "lucide-react";
import LandingThemeToggle from "../components/LandingThemeToggle";

export const metadata: Metadata = {
  title: "Registra tu comercio | Reportes Reconquista",
  description:
    "Suma tu negocio al directorio de comercios de Reconquista. Vidriera digital gratuita con catalogo de productos, contacto por WhatsApp y kit QR para tu local.",
  alternates: { canonical: "https://reportesreconquista.com/para-comercios" },
  openGraph: {
    type: "website",
    url: "https://reportesreconquista.com/para-comercios",
    title: "Registra tu comercio en Reconquista | Reportes Reconquista",
    description: "Suma tu negocio al directorio digital de Reconquista. Vidriera digital gratis con catalogo, WhatsApp y QR para tu vidriera.",
    locale: "es_AR",
  },
};

const BENEFICIOS = [
  {
    icon: Smartphone,
    title: "Vidriera digital gratis",
    desc: "Tu perfil online con foto, descripcion, horario y toda la info de tu negocio. Sin costos de hosting ni diseno.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Package,
    title: "Catalogo de productos",
    desc: "Sube tus productos con foto, descripcion y precio. Tus clientes ven tu stock actualizado desde el celular.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: MessageCircle,
    title: "Contacto directo por WhatsApp",
    desc: "Un boton de WhatsApp en tu perfil para que los clientes te escriban directamente. Sin intermediarios.",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  {
    icon: QrCode,
    title: "Kit QR para tu vidriera",
    desc: "Descarga un cartel A5 con QR listo para imprimir. Pegalo en la vidriera y tus clientes escanean para ver tu catalogo.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Users,
    title: "Comunidad de Reconquista",
    desc: "Llega a cientos de vecinos de Reconquista que usan la app a diario para encontrar comercios locales.",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: BarChart3,
    title: "Destacados y visibilidad",
    desc: "Los comercios mas activos aparecen primero en los destacados. El plan premium te garantiza el primer lugar.",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Registrate en segundos",
    desc: "Completa nombre, rubro, barrio, telefono, horario y una foto de tu local. Listo, ya estas en el directorio.",
  },
  {
    n: "02",
    title: "Carga tu catalogo",
    desc: "Agrega tus productos o servicios con foto, descripcion y precio. Actualiza cuando quieras desde tu celular.",
  },
  {
    n: "03",
    title: "Imprime tu cartel QR",
    desc: "Descarga el kit de vidriera con el QR de tu perfil y pegalo en tu local. Tus clientes escanean y ven tu catalogo.",
  },
];

export default function ParaComerciosPage() {
  return (
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
              href="/comercio/nuevo"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-bold rounded-xl transition-colors"
            >
              Registrar mi comercio
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.06)_0%,_transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

          {/* Text */}
          <div className="flex-1 max-w-lg text-center lg:text-left">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-5">
              Para comerciantes de Reconquista
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-[1.1] mb-5 tracking-tight">
              Tu negocio,{" "}
              <span className="text-amber-500 dark:text-amber-400">visible para toda la ciudad</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8">
              Registra tu comercio en minutos y tene tu vidriera digital gratuita. Catalogo de productos, contacto por WhatsApp y un cartel QR listo para imprimir.
            </p>
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
              <Link
                href="/comercio/nuevo"
                className="inline-flex items-center gap-2 px-7 py-4 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black rounded-2xl transition-colors text-sm"
              >
                Registrar mi comercio gratis
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/comercios"
                className="inline-flex items-center gap-2 px-7 py-4 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold rounded-2xl transition-colors text-sm"
              >
                Ver directorio
              </Link>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">100% gratuito para empezar. Sin tarjeta de credito.</p>
          </div>

          {/* Mockup vidriera — stays dark (phone screen) */}
          <div className="relative shrink-0 order-first lg:order-last">
            <div className="absolute -inset-8 bg-amber-500/8 rounded-full blur-3xl" />
            <div className="relative w-64 rounded-[44px] border-[3px] border-gray-700 bg-gray-900 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
              {/* Dynamic island */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-black rounded-b-2xl z-20" />
              {/* Status bar */}
              <div className="flex items-center justify-between px-5 pt-6 pb-1">
                <span className="text-[8px] text-white/40 font-semibold">9:41</span>
                <div className="flex gap-px items-end" style={{ height: 10 }}>
                  {[40, 60, 80, 100].map((h, i) => (
                    <div key={i} className="w-0.5 bg-white/40 rounded-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              {/* Cover */}
              <div className="h-28 bg-gradient-to-br from-amber-900/60 via-orange-900/30 to-gray-900 relative">
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 to-transparent" />
                <div className="absolute -bottom-5 left-4 w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center shadow-xl">
                  <Store className="w-7 h-7 text-amber-400" />
                </div>
              </div>
              {/* Content */}
              <div className="px-4 pt-7 pb-2">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="font-black text-white text-sm leading-tight">Ferreteria El Tornillo</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Tag className="w-2.5 h-2.5 text-amber-400" />
                      <p className="text-amber-400 text-[9px]">Ferreteria</p>
                      <span className="text-gray-700 text-[9px]">·</span>
                      <MapPin className="w-2.5 h-2.5 text-gray-500" />
                      <p className="text-gray-500 text-[9px]">Centro</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 bg-yellow-500/10 px-1.5 py-1 rounded-lg">
                    <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 text-[9px] font-bold">4.8</span>
                  </div>
                </div>
                <p className="text-gray-500 text-[9px] leading-relaxed mb-2">
                  Todo en herramientas, materiales y accesorios para tu hogar y obra.
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5 text-gray-500" />
                    <span className="text-gray-500 text-[8px]">0482-12345</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-gray-500" />
                    <span className="text-gray-500 text-[8px]">8:00 a 20:00</span>
                  </div>
                </div>
                {/* Productos */}
                <p className="text-gray-500 text-[8px] font-semibold uppercase tracking-wide mb-1.5">Catalogo</p>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {[
                    { name: "Taladro 600W", price: "$45.000" },
                    { name: "Cinta 5m", price: "$3.200" },
                    { name: "Pintura látex", price: "$12.500" },
                  ].map((p, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-1.5 text-center">
                      <div className="w-7 h-7 bg-gray-700/60 rounded-lg mx-auto mb-1 flex items-center justify-center">
                        <Package className="w-3 h-3 text-gray-500" />
                      </div>
                      <p className="text-white text-[7px] font-semibold leading-tight truncate">{p.name}</p>
                      <p className="text-amber-400 text-[7px] mt-0.5">{p.price}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full py-2.5 bg-green-500/20 border border-green-500/30 text-green-400 text-[9px] font-bold rounded-xl flex items-center justify-center gap-1.5 mb-2">
                  <MessageCircle className="w-3 h-3" />
                  Contactar por WhatsApp
                </button>
                <div className="flex items-center gap-1.5 bg-gray-800/60 rounded-xl px-3 py-2">
                  <QrCode className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="text-gray-400 text-[8px]">Kit QR vidriera disponible</span>
                </div>
              </div>
              <div className="h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-200/60 dark:border-gray-800/60 bg-gray-50 dark:bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-3 gap-4 text-center">
          {[
            { value: "500+", label: "Vecinos en la app" },
            { value: "Gratis", label: "Para empezar" },
            { value: "5 min", label: "Para registrarte" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl sm:text-4xl font-black text-amber-500 dark:text-amber-400">{s.value}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Beneficios */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3">Por que registrarte</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Todo lo que tenes gratis</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl mx-auto">Sin costos ocultos, sin contratos. Registras tu comercio y ya estas online.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFICIOS.map((b) => (
            <div key={b.title} className={`p-6 rounded-2xl border ${b.bg}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${b.bg}`}>
                <b.icon className={`w-5 h-5 ${b.color}`} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{b.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pasos */}
      <section className="border-t border-gray-200/60 dark:border-gray-800/60 bg-gray-50 dark:bg-gray-900/20">
        <div className="max-w-3xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Como empezar</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Tres pasos y ya estas en el directorio digital de Reconquista.</p>
          </div>
          <div className="space-y-4">
            {STEPS.map((s) => (
              <div key={s.n} className="flex items-start gap-5 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <span className="text-amber-500 dark:text-amber-400 font-black text-sm">{s.n}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{s.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3">Planes y precios</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Simple y transparente</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl mx-auto">Empeza gratis hoy mismo. Cuando tu comercio crezca, pasate a un plan superior con un mensaje de WhatsApp.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">

          {/* Gratis */}
          <div className="flex flex-col rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-7">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Gratis</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-black text-gray-900 dark:text-white">$0</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-600 mb-7">Para siempre</p>
            <ul className="space-y-3 flex-1">
              {[
                "Perfil completo del comercio",
                "Hasta 50 productos en el catálogo",
                "Contacto directo por WhatsApp",
                "Kit QR para la vidriera",
                "2 análisis con IA por día",
                "Posición estándar en el listado",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/comercio/nuevo"
              className="mt-8 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Premium — destacado */}
          <div className="flex flex-col rounded-3xl border-2 border-indigo-500 bg-indigo-600 p-7 relative shadow-xl shadow-indigo-500/25">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-black px-3 py-1 rounded-full bg-white text-indigo-600 shadow-sm whitespace-nowrap">
              ✦ Más popular
            </span>
            <p className="text-sm font-bold text-indigo-200 mb-1">Premium</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-black text-white">U$5</span>
              <span className="text-indigo-300 text-sm mb-1.5">/mes</span>
            </div>
            <p className="text-xs text-indigo-300 mb-7">Cancelás cuando quieras</p>
            <ul className="space-y-3 flex-1">
              {[
                "Todo lo del plan Gratis",
                "Hasta 100 productos en el catálogo",
                "20 análisis con IA por día",
                "5 imágenes de catálogo IA por día",
                "Posición preferente en el listado",
                "Más visibilidad en Destacados",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-indigo-100">
                  <Check className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={`https://wa.me/543482445015?text=${encodeURIComponent("Hola! Quiero activar el plan Premium para mi comercio en Reportes Reconquista.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm bg-white text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Activar Premium
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Master */}
          <div className="flex flex-col rounded-3xl border border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10 p-7">
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-1">Master · Founder</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-black text-gray-900 dark:text-white">U$10</span>
              <span className="text-gray-400 text-sm mb-1.5">/mes</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-500 mb-7">★ Insignia permanente</p>
            <ul className="space-y-3 flex-1">
              {[
                "Todo lo del plan Premium",
                "Productos ilimitados",
                "IA ilimitada todos los días",
                "Posición primera garantizada",
                "Insignia Founder permanente",
                "Soporte prioritario por WhatsApp",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={`https://wa.me/543482445015?text=${encodeURIComponent("Hola! Quiero activar el plan Master para mi comercio en Reportes Reconquista.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-gray-950 transition-colors"
            >
              Activar Master
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
          Todos los planes se activan vía WhatsApp en minutos. Sin tarjeta de crédito.
        </p>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Listo para sumarte?</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Cientos de vecinos de Reconquista usan la app todos los dias. Tu negocio tiene que estar ahi.
        </p>
        <Link
          href="/comercio/nuevo"
          className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black rounded-2xl transition-colors"
        >
          Registrar mi comercio gratis
          <ChevronRight className="w-5 h-5" />
        </Link>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">Sin tarjeta de credito. Sin contratos. 100% gratuito.</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Logo" className="w-7 h-7 rounded-xl" />
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Reportes Reconquista</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Home</Link>
            <Link href="/comercios" className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Ver comercios</Link>
            <Link href="/comercio/nuevo" className="text-xs text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors font-semibold">Registrarme</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
