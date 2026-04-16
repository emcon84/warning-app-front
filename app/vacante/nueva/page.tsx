import { Metadata } from "next";
import NuevaVacanteClient from "./NuevaVacanteClient";

export const metadata: Metadata = {
  title: "Publicar vacante - Reconquista",
  description: "Publicá una vacante y encontrá al candidato ideal en Reconquista, Santa Fe.",
};

export default function NuevaVacantePage() {
  return <NuevaVacanteClient />;
}
