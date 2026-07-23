"use client";

import { useTheme } from "../contexts/ThemeContext";
import Navbar from "../components/Navbar";
import type { Professional, Comercio, TurnoResponse, Supermarket } from "../types";
import { HeroSlider } from "./components/HeroSlider";
import { HomePromoBanner } from "./components/HomePromoBanner";
import { HomeCommunitySection } from "./components/HomeCommunitySection";
import { HomeRecentProducts } from "./components/HomeRecentProducts";
import { HomeTurnoBanner } from "./components/HomeTurnoBanner";
import { HomeProfessionalsSlider } from "./components/HomeProfessionalsSlider";
import { HomeHogarSection } from "./components/HomeHogarSection";
import { NewsCarousel } from "../components/NewsCarousel";
import { HomeStoresSlider } from "./components/HomeStoresSlider";
import { HomeSupermarketsSection } from "./components/HomeSupermarketsSection";
import { HomeEventsSection } from "./components/HomeEventsSection";
import type { Evento } from "@/lib/types/evento";

interface HeroSlideData {
  id: string;
  slideType: "professional" | "comercio" | "promo";
  title: string;
  subtitle: string | null;
  description: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  imageUrl: string | null;
  imagePosition: string;
}

interface Props {
  professionals: Professional[];
  comercios: Comercio[];
  turno: TurnoResponse | null;
  supermarkets: Supermarket[];
  eventos: Evento[];
  heroSlides: HeroSlideData[];
}

export default function HomeClient({ professionals, comercios, turno, supermarkets, eventos, heroSlides }: Props) {
  const { isDark } = useTheme();

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <Navbar sidebarDisabled />

      <HeroSlider slides={heroSlides} />

      <div className="max-w-xl md:max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-32">
        <NewsCarousel />
        <HomeProfessionalsSlider professionals={professionals} />
        <HomeCommunitySection />
        <HomeStoresSlider comercios={comercios} />
        <HomePromoBanner />
        <HomeRecentProducts />
        <HomeEventsSection eventos={eventos} />
        <HomeTurnoBanner turno={turno} />
        <HomeHogarSection />
        <HomeSupermarketsSection supermarkets={supermarkets} />
      </div>
    </div>
  );
}
