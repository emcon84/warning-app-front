import { Metadata } from "next";
import NuevoProfesionalClient from "./NuevoProfesionalClient";

export const metadata: Metadata = {
  title: "Registrarse como profesional - Reconquista",
  description: "Creá tu perfil de profesional de oficio en Reconquista y conseguí clientes.",
};

export default function NuevoProfesionalPage() {
  return <NuevoProfesionalClient />;
}
