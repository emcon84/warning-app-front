import { Metadata } from "next";
import NuevoEmpleadoClient from "./NuevoEmpleadoClient";

export const metadata: Metadata = {
  title: "Publicar perfil de empleado - Reconquista",
  description: "Publicá tu CV y encontrá oportunidades laborales en Reconquista, Santa Fe.",
};

export default function NuevoEmpleadoPage() {
  return <NuevoEmpleadoClient />;
}
