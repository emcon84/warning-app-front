import { Zap, Flame, Droplets, HardHat, Trees, Settings2 } from "lucide-react";

export const HOGAR_CATS = [
  { label: "Gasistas",      Icon: Flame,     image: "/banners/gasistas.webp",  tag: "gasista"      },
  { label: "Electricistas", Icon: Zap,       image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=200&fit=crop&q=80", tag: "electricista" },
  { label: "Plomeros",      Icon: Droplets,  image: "/banners/plomeros.webp",  tag: "plomero"      },
  { label: "Albañiles",     Icon: HardHat,   image: "/banners/albanil.webp",   tag: "albañil"      },
  { label: "Carpinteros",   Icon: Trees,     image: "/banners/carpintero.webp",tag: "carpintero"   },
  { label: "Mecánicos",     Icon: Settings2, image: "/banners/mecanicos.webp", tag: "mecánico"     },
] as const;

// ── Gradient palettes — still used by HomeStoresSlider & HomeProfessionalsSlider ──
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
  enter: (dir: number = 1) => ({ x: dir > 0 ? 360 : -360, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number = 1) => ({ x: dir > 0 ? -360 : 360, opacity: 0 }),
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

export const HERO_PROMOS: PromoSlide[] = [
  {
    type: "promo",
    id: "hero-marketplace",
    tag: "TU CIUDAD EN UN SOLO LUGAR",
    title: "Encontrá todo en Reconquista",
    subtitle: "Profesionales, comercios, ofertas y servicios cerca tuyo.",
    cta: "Explorar",
    href: "/comercios",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop&q=80",
    gradient: "from-emerald-950/98 via-emerald-950/85 to-emerald-900/50",
    accent: "bg-white text-gray-900",
  },
  {
    type: "promo",
    id: "hero-reportes",
    tag: "REPORTES EN VIVO",
    title: "Sumate a la red de alertas",
    subtitle: "Recibí notificaciones de robos, accidentes y eventos en tiempo real en tu zona.",
    cta: "Ver reportes",
    href: "/app",
    image: "https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=1200&h=600&fit=crop&q=80",
    gradient: "from-rose-950/98 via-rose-950/85 to-rose-900/50",
    accent: "bg-rose-400 text-white",
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
