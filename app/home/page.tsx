import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { Professional, Comercio, Supermarket, TurnoResponse } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const metadata: Metadata = {
  title: "Inicio | Reportes Reconquista",
  description: "Encontrá profesionales, comercios, farmacias de turno y más en Reconquista, Santa Fe.",
};

async function fetchHomeData() {
  const [professionals, comercios, turno, supermarkets] = await Promise.all([
    fetch(`${API}/api/professionals`, { cache: "no-store" }).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(`${API}/api/comercios`, { cache: "no-store" }).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(`${API}/api/farmacias/turno`, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${API}/api/supermarkets`, { cache: "no-store" }).then(r => r.ok ? r.json() : []).catch(() => []),
  ]);
  return {
    professionals: professionals as Professional[],
    comercios: comercios as Comercio[],
    turno: turno as TurnoResponse | null,
    supermarkets: supermarkets as Supermarket[],
  };
}

export default async function HomePage() {
  const { professionals, comercios, turno, supermarkets } = await fetchHomeData();
  return (
    <HomeClient
      professionals={professionals}
      comercios={comercios}
      turno={turno}
      supermarkets={supermarkets}
    />
  );
}
