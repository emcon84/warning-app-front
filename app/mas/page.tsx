import { Metadata } from "next";
import MasClient from "./MasClient";

export const metadata: Metadata = {
  title: "Mas servicios | Reportes Reconquista",
};

export default function MasPage() {
  return <MasClient />;
}
