"use client";

import { useState } from "react";
import { Pencil, ShoppingBag, Package, Share2, Check } from "lucide-react";
import type { Comercio } from "@/types";
import type { ThemeClasses } from "./types";
import { StoreProductCard } from "./StoreProductCard";

interface Props {
  comercio: Comercio;
  theme: ThemeClasses;
  isOwner?: boolean;
  onManage: () => void;
}

type Filtro = "todos" | "producto" | "servicio";

export function StoreCatalog({ comercio, theme, isOwner, onManage }: Props) {
  const { isDark, textPrimary, textMuted, cardBg } = theme;
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [copied, setCopied] = useState(false);

  const todos = comercio.productos ?? [];
  const tieneProductos = todos.some(p => p.tipo !== "servicio");
  const tieneServicios = todos.some(p => p.tipo === "servicio");
  const mostrarFiltro  = tieneProductos && tieneServicios;

  const activos = filtro === "todos"
    ? todos
    : todos.filter(p => (filtro === "servicio" ? p.tipo === "servicio" : p.tipo !== "servicio"));

  if (todos.length === 0 && !isOwner) return null;

  const cartComercio = {
    id:          comercio.id,
    nombre:      comercio.nombre,
    slug:        comercio.slug,
    whatsapp:    comercio.whatsapp,
    aceptaEnvios: comercio.aceptaEnvios ?? false,
    zonaEnvio:   comercio.zonaEnvio ?? null,
    costoEnvio:  comercio.costoEnvio ?? null,
  };

  async function handleShare() {
    const url = `${window.location.origin}/comercio/${comercio.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: comercio.nombre, text: `Mirá el catálogo de ${comercio.nombre} en Reportes Reconquista`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const pillBase = `px-3 py-1 rounded-full text-xs font-semibold transition-all`;
  const pillActive = `bg-indigo-500 text-white`;
  const pillInactive = isDark ? `bg-gray-800 text-gray-400 hover:bg-gray-700` : `bg-gray-100 text-gray-500 hover:bg-gray-200`;

  return (
    <div className="mx-4 mt-4 mb-2">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`text-base font-bold ${textPrimary}`}>
            Catálogo
            {todos.length > 0 && <span className={`ml-2 text-sm font-normal ${textMuted}`}>({todos.length})</span>}
          </p>
          <p className={`text-xs mt-0.5 ${textMuted}`}>Consultá por precio o disponibilidad</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all ${
              copied
                ? isDark ? "border-green-500/40 text-green-400 bg-green-500/10" : "border-green-300 text-green-600 bg-green-50"
                : isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
            {copied ? "Copiado!" : "Compartir"}
          </button>
          {isOwner && (
            <button
              onClick={onManage}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border transition-colors ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              <Pencil className="w-3 h-3" /> Gestionar
            </button>
          )}
        </div>
      </div>

      {/* Entrega */}
      {comercio.aceptaEnvios && (
        <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl mb-3 ${isDark ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-700"}`}>
          <Package className="w-4 h-4 flex-shrink-0" />
          <span>
            Envios a domicilio
            {comercio.zonaEnvio ? ` · ${comercio.zonaEnvio}` : ""}
            {comercio.costoEnvio ? ` · ${comercio.costoEnvio}` : ""}
          </span>
        </div>
      )}

      {/* Filtro */}
      {mostrarFiltro && (
        <div className="flex gap-2 mb-3">
          {(["todos", "producto", "servicio"] as Filtro[]).map(f => (
            <button key={f} onClick={() => setFiltro(f)} className={`${pillBase} ${filtro === f ? pillActive : pillInactive}`}>
              {f === "todos" ? "Todos" : f === "producto" ? "Productos" : "Servicios"}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {todos.length === 0 ? (
        <div className={`py-8 text-center rounded-2xl border ${cardBg}`}>
          <ShoppingBag className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
          <p className={`text-sm ${textMuted}`}>No hay items en el catálogo aun.</p>
        </div>
      ) : activos.length === 0 ? (
        <div className={`py-6 text-center rounded-2xl border ${cardBg}`}>
          <p className={`text-sm ${textMuted}`}>No hay {filtro === "producto" ? "productos" : "servicios"} cargados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {activos.map((p) => (
            <StoreProductCard
              key={p.id}
              producto={p}
              whatsapp={comercio.whatsapp}
              comercioNombre={comercio.nombre}
              comercioSlug={comercio.slug}
              cartComercio={cartComercio}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
}
