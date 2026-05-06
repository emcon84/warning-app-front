import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Store, MapPin, Clock, MessageCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Props {
  params: Promise<{ id: string }>;
}

async function getPost(id: string) {
  const res = await fetch(`${API}/api/posts/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) return notFound();

  const foto = post.foto?.startsWith("/uploads/") 
    ? `${API}${post.foto}` 
    : post.foto;

  const comercioLogo = post.comercio?.logo || post.comercio?.foto;
  const logoUrl = comercioLogo?.startsWith("/uploads/") 
    ? `${API}${comercioLogo}` 
    : comercioLogo;

  const tipoConfig: Record<string, { label: string; cls: string; icon: string }> = {
    novedad: { label: "Novedad", cls: "bg-amber-500/15 text-amber-600", icon: "megaphone" },
    oferta: { label: "Oferta", cls: "bg-green-500/15 text-green-600", icon: "tag" },
    sorteo: { label: "Sorteo", cls: "bg-purple-500/15 text-purple-600", icon: "gift" },
  };
  const tipo = tipoConfig[post.tipo] || tipoConfig.novedad;

  const waNumber = (post.comercio?.whatsapp ?? "").replace(/\D/g, "");
  const waText = encodeURIComponent(`Hola! Vi tu ${tipo.label.toLowerCase()} en Reportes Reconquista: "${post.contenido.slice(0, 80)}..."`);
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waText}` : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-32">
        {/* Tipo badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${tipo.cls}`}>
          {tipo.icon === "megaphone" && "📢"}
          {tipo.icon === "tag" && "🏷️"}
          {tipo.icon === "gift" && "🎁"}
          {tipo.label}
        </div>

        {/* Foto del post */}
        {foto && (
          <div className="mb-4">
            <img src={foto} alt="" className="w-full h-64 object-cover rounded-2xl" />
          </div>
        )}

        {/* Contenido */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-4">
          <p className="text-gray-900 dark:text-white text-base leading-relaxed whitespace-pre-wrap">
            {post.contenido}
          </p>
          
          {/* Precios si es oferta */}
          {post.tipo === "oferta" && post.precioDespues && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              {post.precioAntes && (
                <span className="text-gray-400 line-through text-sm">
                  ${post.precioAntes}
                </span>
              )}
              <span className="text-2xl font-black text-green-600">
                ${post.precioDespues}
              </span>
            </div>
          )}

          {/* Fecha del sorteo */}
          {post.tipo === "sorteo" && post.fechaSorteo && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500">Sorteo el:</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(post.fechaSorteo).toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Info del comercio */}
        <Link
          href={`/comercio/${post.comercio?.slug}`}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3"
        >
          {logoUrl ? (
            <img src={logoUrl} alt={post.comercio?.nombre} className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Store className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-white">{post.comercio?.nombre}</p>
            <p className="text-xs text-gray-500">{post.comercio?.barrio}</p>
          </div>
          {waUrl && (
            <a
              href={waUrl}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white text-sm font-bold rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar
            </a>
          )}
        </Link>
      </main>
    </div>
  );
}