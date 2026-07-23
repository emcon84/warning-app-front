import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { Professional, Comercio, Supermarket, TurnoResponse } from "../types";

import { API_URL } from "../lib/api/client";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Encontrá profesionales, comercios, farmacias de turno y más en Reconquista, Santa Fe.",
};

async function fetchHomeData() {
  const [professionals, comercios, turno, supermarkets, eventos, heroSlidesRes] = await Promise.all([
    fetch(`${API_URL}/api/professionals`, { cache: "no-store" }).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(`${API_URL}/api/comercios`, { cache: "no-store" }).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(`${API_URL}/api/farmacias/turno`, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${API_URL}/api/supermarkets`, { cache: "no-store" }).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(`${API_URL}/api/eventos/destacados?limit=5`, { next: { revalidate: 300 } }).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(`${API_URL}/api/hero-slides`, { cache: "no-store" }).then(r => r.ok ? r.json() : { slides: [] }).catch(() => ({ slides: [] })),
  ]);
  const heroSlides = (heroSlidesRes as { slides: any[] }).slides || [];
  return {
    professionals: professionals as Professional[],
    comercios: comercios as Comercio[],
    turno: turno as TurnoResponse | null,
    supermarkets: supermarkets as Supermarket[],
    eventos,
    heroSlides,
  };
}

export default async function HomePage() {
  const { professionals, comercios, turno, supermarkets, eventos, heroSlides } = await fetchHomeData();
  return (
    <HomeClient
      professionals={professionals}
      comercios={comercios}
      turno={turno}
      supermarkets={supermarkets}
      eventos={eventos}
      heroSlides={heroSlides}
    />
  );
}
