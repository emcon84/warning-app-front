import { Metadata } from "next";
import NuevoComercioClient from "./NuevoComercioClient";

export const metadata: Metadata = {
  title: "Registrar comercio - Reconquista",
  description: "Creá el perfil de tu comercio en Reconquista y llegá a más clientes.",
};

export default function NuevoComercioPage() {
  return <NuevoComercioClient />;
}
