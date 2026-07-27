import { Metadata } from "next";
import { Suspense } from "react";
import ComerciosClient from "./ComerciosClient";
import { Comercio } from "../types";

import { API_URL } from "../lib/api/client";

export const metadata: Metadata = {
  title: "Comercios en Reconquista",
  description: "Encontra negocios locales, tiendas y servicios en Reconquista.",
};

async function getComerciosData(): Promise<Comercio[]> {
  try {
    const res = await fetch(`${API_URL}/api/comercios`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function ComerciosPage() {
  const comercios = await getComerciosData();
  return (
    <Suspense>
      <ComerciosClient comercios={comercios} />
    </Suspense>
  );
}
