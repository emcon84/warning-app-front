import { Suspense } from "react";
import { Professional, Comercio, Doctor } from "../types";
import BuscarClient from "./BuscarClient";

import { API_URL } from "../lib/api/client";

async function fetchSearchData() {
  const [professionals, comercios, doctors] = await Promise.all([
    fetch(`${API_URL}/api/professionals`, { cache: "no-store" }).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(`${API_URL}/api/comercios`, { cache: "no-store" }).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(`${API_URL}/api/doctors`, { cache: "no-store" }).then(r => r.ok ? r.json() : []).catch(() => []),
  ]);
  return {
    professionals: professionals as Professional[],
    comercios: comercios as Comercio[],
    doctors: doctors as Doctor[],
  };
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { professionals, comercios, doctors } = await fetchSearchData();
  return (
    <BuscarClient
      professionals={professionals}
      comercios={comercios}
      doctors={doctors}
      initialQuery={q || ""}
    />
  );
}
