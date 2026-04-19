import { notFound } from "next/navigation";
import OfertaDetailClient from "./OfertaDetailClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; offerId: string }> }) {
  const { slug, offerId } = await params;
  try {
    const res = await fetch(`${API}/api/comercios/${slug}/offers/${offerId}`, { cache: "no-store" });
    if (!res.ok) return {};
    const data = await res.json();
    return {
      title: `${data.titulo} — ${data.comercio.nombre}`,
      description: data.descripcion ?? `Oferta de ${data.comercio.nombre}`,
      openGraph: {
        title: `${data.titulo} — ${data.comercio.nombre}`,
        description: data.descripcion ?? "",
        images: data.foto ? [`${API}${data.foto}`] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function OfertaPage({ params }: { params: Promise<{ slug: string; offerId: string }> }) {
  const { slug, offerId } = await params;
  const res = await fetch(`${API}/api/comercios/${slug}/offers/${offerId}`, { cache: "no-store" });
  if (!res.ok) notFound();
  const data = await res.json();
  return <OfertaDetailClient offer={data} comercio={data.comercio} />;
}
