import { Metadata } from "next";
import PatioLimpioClient from "./PatioLimpioClient";

export const metadata: Metadata = {
  title: "Patio Limpio - Cronograma de Recolección | Reconquista",
  description:
    "Consultá el cronograma mensual de Patio Limpio en Reconquista. Zonas, barrios, fechas para sacar residuos y días de recolección.",
};

export default function PatioLimpioPage() {
  return <PatioLimpioClient />;
}
