"use client";

import { useUser } from "@clerk/nextjs";
import { useTheme } from "../contexts/ThemeContext";
import Navbar from "../components/Navbar";
import type { Professional, Comercio, TurnoResponse, Supermarket } from "../types";
import { HomeHero } from "./components/HomeHero";
import { HomeSectionBanners } from "./components/HomeSectionBanners";
import { HomePromoBanner } from "./components/HomePromoBanner";
import { HomeCommunitySection } from "./components/HomeCommunitySection";
import { HomeRecentProducts } from "./components/HomeRecentProducts";
import { HomeTurnoBanner } from "./components/HomeTurnoBanner";
import { HomeProfessionalsSlider } from "./components/HomeProfessionalsSlider";
import { HomeHogarSection } from "./components/HomeHogarSection";
import { HomeStoresSlider } from "./components/HomeStoresSlider";
import { HomeSupermarketsSection } from "./components/HomeSupermarketsSection";
import { HomeEventsSection } from "./components/HomeEventsSection";
import type { Evento } from "@/lib/types/evento";

interface Props {
  professionals: Professional[];
  comercios: Comercio[];
  turno: TurnoResponse | null;
  supermarkets: Supermarket[];
  eventos: Evento[];
}

export default function HomeClient({ professionals, comercios, turno, supermarkets, eventos }: Props) {
  const { user } = useUser();
  const { isDark } = useTheme();

  const greeting = user?.firstName ? `¡Hola, ${user.firstName}!` : "¡Hola, Bienvenido!";
  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <Navbar sidebarDisabled />

      <HomeHero greeting={greeting} />

      <div className="max-w-xl md:max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-32">
        <HomeSectionBanners />
        <HomeEventsSection eventos={eventos} />
        <HomePromoBanner />
        <HomeCommunitySection />
        <HomeRecentProducts />
        <HomeTurnoBanner turno={turno} />
        <HomeProfessionalsSlider professionals={professionals} />
        <HomeHogarSection />
        <HomeStoresSlider comercios={comercios} />
        <HomeSupermarketsSection supermarkets={supermarkets} />
      </div>
    </div>
  );
}
