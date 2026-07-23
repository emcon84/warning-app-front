import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando...</div>}>{children}</Suspense>;
}
