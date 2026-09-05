import { Suspense } from "react";
import GestionarComercioClient from "./GestionarComercioClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi comercio" };

export default function GestionarComercioPage() {
  return (
    <Suspense>
      <GestionarComercioClient />
    </Suspense>
  );
}
