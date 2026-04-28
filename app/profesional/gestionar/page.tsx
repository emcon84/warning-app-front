import { Metadata } from "next";
import { Suspense } from "react";
import GestionarProfesionalClient from "./GestionarProfesionalClient";

export const metadata: Metadata = {
  title: "Mi panel profesional",
  robots: "noindex",
};

export default function GestionarProfesionalPage() {
  return (
    <Suspense>
      <GestionarProfesionalClient />
    </Suspense>
  );
}
