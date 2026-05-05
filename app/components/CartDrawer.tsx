"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ChevronLeft,
  Package,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";

type EntregaMode = "retiro" | "envio";

function formatearPedido(
  items: ReturnType<typeof useCart>["items"],
  comercio: NonNullable<ReturnType<typeof useCart>["comercio"]>,
  entrega: EntregaMode,
  direccion: string
): string {
  const lineas = items
    .map(
      (i) =>
        `${i.nombre} x${i.cantidad} - ${i.precioStr ?? "Precio a confirmar"}`
    )
    .join("\n");

  const entregaStr =
    entrega === "retiro"
      ? "Retiro en el local"
      : `Envio a domicilio: ${direccion}`;

  return (
    `Hola ${comercio.nombre}! Te hago un pedido via Reportes Reconquista:\n\n` +
    `${lineas}\n\n` +
    `Entrega: ${entregaStr}\n\n` +
    `Enviado desde reportesreconquista.com/comercio/${comercio.slug}`
  );
}

export default function CartDrawer() {
  const { items, comercio, removeItem, updateQuantity, clearCart, isOpen, closeCart } =
    useCart();

  const [step, setStep] = useState<"cart" | "entrega">("cart");
  const [entrega, setEntrega] = useState<EntregaMode>("retiro");
  const [direccion, setDireccion] = useState("");

  function handleClose() {
    closeCart();
    setStep("cart");
    setEntrega("retiro");
    setDireccion("");
  }

  function handleConfirmar() {
    if (!comercio) return;
    const whatsappNumber = comercio.whatsapp.replace(/\D/g, "");
    const mensaje = formatearPedido(items, comercio, entrega, direccion);
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
    handleClose();
    clearCart();
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[1999] bg-black/50"
          onClick={handleClose}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 z-[2000] flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {step === "cart" ? (
          <CartStep
            comercio={comercio}
            items={items}
            removeItem={removeItem}
            updateQuantity={updateQuantity}
            clearCart={clearCart}
            onClose={handleClose}
            onNext={() => setStep("entrega")}
          />
        ) : (
          <EntregaStep
            comercio={comercio}
            entrega={entrega}
            setEntrega={setEntrega}
            direccion={direccion}
            setDireccion={setDireccion}
            onBack={() => setStep("cart")}
            onConfirmar={handleConfirmar}
          />
        )}
      </div>
    </>
  );
}

interface CartStepProps {
  comercio: ReturnType<typeof useCart>["comercio"];
  items: ReturnType<typeof useCart>["items"];
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  onClose: () => void;
  onNext: () => void;
}

function CartStep({
  comercio,
  items,
  removeItem,
  updateQuantity,
  clearCart,
  onClose,
  onNext,
}: CartStepProps) {
  const totalItems = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-white text-base">
            Tu pedido
          </span>
          {totalItems > 0 && (
            <span className="bg-amber-500 text-gray-950 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {totalItems}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mt-8">
            Tu carrito esta vacio
          </p>
        ) : (
          items.map((item) => (
            <div key={item.productoId} className="flex items-center gap-3">
              {item.foto ? (
                <Image
                  src={item.foto}
                  alt={item.nombre}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.nombre}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.precioStr ?? "Sin precio"}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    onClick={() => updateQuantity(item.productoId, -1)}
                    className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-5 text-center">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productoId, 1)}
                    className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => removeItem(item.productoId)}
                    className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {comercio?.aceptaEnvios && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Package size={16} className="mt-0.5 shrink-0 text-green-500" />
            <div>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                Envio disponible
              </span>
              {comercio.zonaEnvio && (
                <span className="text-gray-500 dark:text-gray-400">
                  {": "}
                  {comercio.zonaEnvio}
                </span>
              )}
              {comercio.costoEnvio && (
                <span className="ml-1 text-gray-500 dark:text-gray-400">
                  | {comercio.costoEnvio}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex gap-2 shrink-0">
        <button
          onClick={clearCart}
          disabled={items.length === 0}
          className="flex-1 py-2 text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Vaciar carrito
        </button>
        <button
          onClick={onNext}
          disabled={items.length === 0}
          className="flex-1 py-2 text-sm font-semibold rounded-xl bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <MessageCircle size={15} />
          Hacer pedido
        </button>
      </div>
    </>
  );
}

interface EntregaStepProps {
  comercio: ReturnType<typeof useCart>["comercio"];
  entrega: EntregaMode;
  setEntrega: (m: EntregaMode) => void;
  direccion: string;
  setDireccion: (d: string) => void;
  onBack: () => void;
  onConfirmar: () => void;
}

function EntregaStep({
  comercio,
  entrega,
  setEntrega,
  direccion,
  setDireccion,
  onBack,
  onConfirmar,
}: EntregaStepProps) {
  const canConfirm = entrega === "retiro" || (entrega === "envio" && direccion.trim().length > 0);

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold text-gray-900 dark:text-white text-base">
          Como recibis el pedido?
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
          <input
            type="radio"
            name="entrega"
            value="retiro"
            checked={entrega === "retiro"}
            onChange={() => setEntrega("retiro")}
            className="accent-amber-500"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Retiro en el local
          </span>
        </label>

        {comercio?.aceptaEnvios && (
          <>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <input
                type="radio"
                name="entrega"
                value="envio"
                checked={entrega === "envio"}
                onChange={() => setEntrega("envio")}
                className="accent-amber-500"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Envio a domicilio
              </span>
            </label>

            {entrega === "envio" && (
              <div className="flex items-start gap-2 px-1">
                <MapPin size={15} className="mt-2.5 shrink-0 text-gray-400" />
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ingresa tu direccion..."
                  className="flex-1 text-sm py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 shrink-0">
        <button
          onClick={onConfirmar}
          disabled={!canConfirm}
          className="w-full py-2.5 text-sm font-semibold rounded-xl bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <MessageCircle size={15} />
          Confirmar y abrir WhatsApp
        </button>
      </div>
    </>
  );
}
