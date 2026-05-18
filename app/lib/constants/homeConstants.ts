import {
  Wrench, Store, ShoppingCart, Zap, Flame, Droplets,
  HardHat, Settings2, Stethoscope, Pill, Map, Trees,
} from "lucide-react";

export const SECTION_BANNERS = [
  {
    label: "Oficios",
    sub: "Plomeros, electricistas y más",
    href: "/oficios",
    Icon: Wrench,
    gradient: "from-blue-600 to-indigo-700",
    glow: "shadow-blue-500/30",
  },
  {
    label: "Comercios",
    sub: "Catálogos y ofertas locales",
    href: "/comercios",
    Icon: Store,
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/30",
  },
  {
    label: "Médicos",
    sub: "IAPOS, PAMI y más",
    href: "/medicos",
    Icon: Stethoscope,
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/30",
  },
  {
    label: "Ofertas",
    sub: "Supermercados de Reconquista",
    href: "/ofertas",
    Icon: ShoppingCart,
    gradient: "from-yellow-400 to-orange-500",
    glow: "shadow-yellow-500/30",
  },
  {
    label: "Farmacias",
    sub: "Turno de hoy",
    href: "/app?view=farmacias",
    Icon: Pill,
    gradient: "from-green-500 to-emerald-600",
    glow: "shadow-green-500/30",
  },
  {
    label: "Mapa",
    sub: "Reportes en tiempo real",
    href: "/app",
    Icon: Map,
    gradient: "from-slate-500 to-gray-700",
    glow: "shadow-slate-500/30",
  },
] as const;

export const HOGAR_CATS = [
  { label: "Gasistas",      Icon: Flame,     image: "/banners/gasistas.webp",  tag: "gasista"      },
  { label: "Electricistas", Icon: Zap,       image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=200&fit=crop&q=80", tag: "electricista" },
  { label: "Plomeros",      Icon: Droplets,  image: "/banners/plomeros.webp",  tag: "plomero"      },
  { label: "Albañiles",     Icon: HardHat,   image: "/banners/albanil.webp",   tag: "albañil"      },
  { label: "Carpinteros",   Icon: Trees,     image: "/banners/carpintero.webp",tag: "carpintero"   },
  { label: "Mecánicos",     Icon: Settings2, image: "/banners/mecanicos.webp", tag: "mecánico"     },
] as const;

export const PRO_GRADIENTS = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-indigo-500 to-indigo-700",
  "from-cyan-500 to-cyan-700",
  "from-violet-500 to-violet-700",
] as const;

export const COMERCIO_BG_GRADIENTS = [
  "from-purple-900 via-purple-800 to-indigo-900",
  "from-blue-900 via-blue-800 to-cyan-900",
  "from-violet-900 via-violet-800 to-purple-800",
  "from-indigo-900 via-indigo-800 to-blue-900",
  "from-slate-800 via-slate-700 to-indigo-900",
] as const;

export const slideVariants = {
  enter: () => ({ scale: 0.92, opacity: 0, filter: "blur(4px)" }),
  center: { scale: 1, opacity: 1, filter: "blur(0px)" },
  exit: () => ({ scale: 1.06, opacity: 0, filter: "blur(2px)" }),
};

export interface PromoSlide {
  type: "promo";
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  gradient: string;
  accent: string;
}

export type SlideItem<T> = { type: "profile"; data: T } | PromoSlide;

export const PRO_PROMOS: PromoSlide[] = [
  {
    type: "promo",
    id: "pro-cta",
    tag: "OFRECÉ TUS SERVICIOS",
    title: "Tu oficio tiene valor. Hacelo visible.",
    subtitle: "Creá tu perfil gratis y llegá a cientos de vecinos de Reconquista que buscan tu trabajo.",
    cta: "Crear mi perfil",
    href: "/profesional/nuevo",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop&q=80",
    gradient: "from-slate-950/98 via-slate-950/85 to-slate-900/50",
    accent: "bg-white text-gray-900",
  },
  {
    type: "promo",
    id: "pro-ranking",
    tag: "SISTEMA DE RANKING",
    title: "Los mejores aparecen primero.",
    subtitle: "Calificaciones de vecinos + recomendaciones = más visibilidad en Destacados.",
    cta: "Ver profesionales",
    href: "/oficios",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop&q=80",
    gradient: "from-amber-950/98 via-amber-950/85 to-amber-900/50",
    accent: "bg-amber-400 text-gray-900",
  },
];

export const COM_PROMOS: PromoSlide[] = [
  {
    type: "promo",
    id: "com-founder",
    tag: "INSIGNIA FOUNDER",
    title: "Sé de los primeros. Para siempre.",
    subtitle: "La insignia Founder es permanente y da máxima visibilidad a tu comercio en toda la app.",
    cta: "Registrar mi comercio",
    href: "/comercio/nuevo",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&q=80",
    gradient: "from-blue-950/98 via-blue-950/85 to-blue-900/50",
    accent: "bg-white text-gray-900",
  },
  {
    type: "promo",
    id: "com-cta",
    tag: "COMERCIOS LOCALES",
    title: "Tus clientes te buscan acá.",
    subtitle: "Mostrá tus productos, ofertas y contacto directo por WhatsApp. Simple y gratis.",
    cta: "Crear mi perfil",
    href: "/comercio/nuevo",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop&q=80",
    gradient: "from-violet-950/98 via-violet-950/85 to-violet-900/50",
    accent: "bg-purple-400 text-white",
  },
];

export function buildMixed<T>(items: T[], promos: PromoSlide[], every: number): SlideItem<T>[] {
  const result: SlideItem<T>[] = [];
  let pi = 0;
  items.forEach((item, i) => {
    result.push({ type: "profile", data: item });
    if ((i + 1) % every === 0 && pi < promos.length) result.push(promos[pi++]);
  });
  while (pi < promos.length) result.push(promos[pi++]);
  return result;
}
