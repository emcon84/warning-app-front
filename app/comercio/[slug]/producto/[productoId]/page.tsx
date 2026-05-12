import { notFound } from "next/navigation";
import ProductoDetailClient from "./ProductoDetailClient";

import { API_URL } from "../../../../lib/api/client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productoId: string }>;
}) {
  const { slug, productoId } = await params;
  try {
    const res = await fetch(`/api/comercios/${slug}`, { cache: "no-store" });
    if (!res.ok) return {};
    const data = await res.json();
    const producto = (data.productos ?? []).find((p: { id: string }) => p.id === productoId);
    if (!producto) return {};

    const shareParams = new URLSearchParams({
      nombre: producto.nombre,
      tipo: producto.tipo ?? "producto",
      ...(producto.precio ? { precio: producto.precio } : {}),
      ...(producto.foto ? { foto: `${producto.foto}` } : {}),
      comercio: data.nombre,
      ...(data.logo ? { logo: `${data.logo}` } : {}),
    });

    return {
      title: `${producto.nombre} — ${data.nombre}`,
      description: producto.descripcion ?? `${producto.tipo === "servicio" ? "Servicio" : "Producto"} de ${data.nombre}`,
      openGraph: {
        title: `${producto.nombre} — ${data.nombre}`,
        description: producto.descripcion ?? "",
        images: [`/share/producto?${shareParams.toString()}`],
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string; productoId: string }>;
}) {
  const { slug, productoId } = await params;
  const res = await fetch(`/api/comercios/${slug}`, { cache: "no-store" });
  if (!res.ok) notFound();
  const data = await res.json();
  const producto = (data.productos ?? []).find((p: { id: string }) => p.id === productoId);
  if (!producto) notFound();
  return <ProductoDetailClient comercio={data} producto={producto} />;
}
