"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, ShoppingCart, MessageCircle, Check } from "lucide-react";
import type { Producto } from "../../../types";
import type { ThemeClasses } from "./types";
import { useCart } from "../../../contexts/CartContext";
import { resolvePhotoUrl } from "../../../lib/utils/photo";

interface CartComercio {
  id: string;
  nombre: string;
  slug: string;
  whatsapp: string;
  aceptaEnvios: boolean;
  zonaEnvio: string | null;
  costoEnvio: string | null;
}

interface Props {
  producto: Producto;
  whatsapp: string;
  comercioNombre: string;
  comercioSlug: string;
  cartComercio: CartComercio;
  theme: ThemeClasses;
}

export function StoreProductCard({ producto, whatsapp, comercioNombre, comercioSlug, cartComercio, theme }: Props) {
  const { isDark, textPrimary, textSec, textMuted, cardBg } = theme;
  const { addItem, clearCart } = useCart();
  const [adding, setAdding] = useState<"idle" | "added" | "confirm" | "no_stock">("idle");

  const fotoResolved = producto.foto
    ? resolvePhotoUrl(producto.foto)
    : null;

  const esServicio = producto.tipo === "servicio";
  const sinStock = producto.stock === 0;
  const waMsg = encodeURIComponent(
    esServicio
      ? `Hola ${comercioNombre}! Me interesa el servicio: *${producto.nombre}*${producto.precio ? ` (${producto.precio})` : ""}. ¿Podemos hablar?`
      : `Hola ${comercioNombre}! Me interesa el producto: *${producto.nombre}*${producto.precio ? ` (${producto.precio})` : ""}. ¿Tienen disponibilidad?`
  );
  const waUrl = `https://wa.me/${whatsapp}?text=${waMsg}`;

  function handleAgregar() {
    const result = addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      precioStr: producto.precio ?? null,
      foto: producto.foto ?? null,
      stock: producto.stock ?? null,
    }, cartComercio);

    if (result === "added") {
      setAdding("added");
      setTimeout(() => setAdding("idle"), 1500);
    } else if (result === "wrong_comercio") {
      setAdding("confirm");
    } else if (result === "no_stock") {
      setAdding("no_stock");
      setTimeout(() => setAdding("idle"), 2000);
    }
  }

  function handleVaciarYAgregar() {
    clearCart();
    setAdding("idle");
    setTimeout(() => handleAgregar(), 0);
  }

  return (
    <div className={`rounded-2xl border overflow-hidden flex flex-col ${cardBg}`}>
      {fotoResolved ? (
        <div className="relative w-full h-36 flex-shrink-0">
          <Image src={fotoResolved} alt={producto.nombre} fill className="object-cover" />
        </div>
      ) : (
        <div className={`w-full h-28 flex items-center justify-center flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
          <ShoppingBag className={`w-8 h-8 ${textMuted}`} />
        </div>
      )}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="flex items-start justify-between gap-1">
          <p className={`text-xs font-bold leading-snug line-clamp-2 ${textPrimary}`}>{producto.nombre}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded-full border flex-shrink-0 capitalize ${
            esServicio
              ? isDark ? "bg-blue-900/40 text-blue-400 border-blue-800" : "bg-blue-100 text-blue-700 border-blue-300"
              : isDark ? "bg-amber-900/40 text-amber-400 border-amber-800" : "bg-amber-100 text-amber-700 border-amber-300"
          }`}>
            {producto.tipo ?? "producto"}
          </span>
        </div>
        {producto.descripcion && <p className={`text-xs leading-snug line-clamp-2 ${textSec}`}>{producto.descripcion}</p>}
        {producto.precio && <p className="text-sm font-black text-green-500 dark:text-green-400">{producto.precio}</p>}
        {!esServicio && sinStock && (
          <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"}`}>
            Sin stock
          </span>
        )}
        {!esServicio && typeof producto.stock === "number" && producto.stock > 0 && producto.stock <= 5 && (
          <p className="text-xs text-amber-500">Ultimas {producto.stock} unidades</p>
        )}
        <div className="mt-auto flex flex-col gap-1.5">
          <a
            href={`/comercio/${comercioSlug}/producto/${producto.id}`}
            className={`flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Ver detalle
          </a>
          {!esServicio && (
            adding === "confirm" ? (
              <div className={`rounded-xl p-2 text-xs ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                <p className={`mb-1.5 leading-snug ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  El carrito tiene productos de otro local. Vaciar y agregar este?
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleVaciarYAgregar}
                    className="flex-1 py-1 rounded-lg bg-amber-500 text-gray-950 font-semibold text-xs"
                  >
                    Vaciar
                  </button>
                  <button
                    onClick={() => setAdding("idle")}
                    className={`flex-1 py-1 rounded-lg font-semibold text-xs border ${isDark ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-500"}`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAgregar}
                disabled={sinStock}
                className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                  adding === "added"
                    ? "bg-green-500 text-white"
                    : adding === "no_stock"
                    ? isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"
                    : sinStock
                    ? isDark ? "bg-gray-800 text-gray-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-400 text-gray-950"
                }`}
              >
                {adding === "added" ? (
                  <><Check className="w-3.5 h-3.5" />Agregado</>
                ) : adding === "no_stock" ? (
                  "Sin stock"
                ) : sinStock ? (
                  "Sin stock"
                ) : (
                  <><ShoppingCart className="w-3.5 h-3.5" />Agregar al carrito</>
                )}
              </button>
            )
          )}
          {esServicio && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Consultar servicio
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
