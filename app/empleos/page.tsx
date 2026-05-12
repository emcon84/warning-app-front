import { Metadata } from "next";
import EmpleosClient from "./EmpleosClient";
import { Empleado, Vacante } from "../types";

import { API_URL } from "../lib/api/client";

export const metadata: Metadata = {
  title: "Empleos en Reconquista",
  description: "Busca trabajo o encontra empleados en Reconquista. CVs y vacantes laborales.",
};

async function getData(): Promise<{ empleados: Empleado[]; vacantes: Vacante[] }> {
  try {
    const [eRes, vRes] = await Promise.all([
      fetch(`${API_URL}/api/empleados`, { next: { revalidate: 300 } }),
      fetch(`${API_URL}/api/vacantes`, { next: { revalidate: 300 } }),
    ]);
    const empleados: Empleado[] = eRes.ok ? await eRes.json() : [];
    const vacantes: Vacante[]   = vRes.ok ? await vRes.json() : [];
    return { empleados, vacantes };
  } catch { return { empleados: [], vacantes: [] }; }
}

export default async function EmpleosPage() {
  const { empleados, vacantes } = await getData();
  return <EmpleosClient empleados={empleados} vacantes={vacantes} />;
}
