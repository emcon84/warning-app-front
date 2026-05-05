"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface CartItem {
  productoId: string;
  nombre: string;
  precioStr: string | null;
  foto: string | null;
  cantidad: number;
  stock: number | null;
}

interface CartComercio {
  id: string;
  nombre: string;
  slug: string;
  whatsapp: string;
  aceptaEnvios: boolean;
  zonaEnvio: string | null;
  costoEnvio: string | null;
}

type AddResult = "added" | "wrong_comercio" | "no_stock";

interface CartContextType {
  items: CartItem[];
  comercio: CartComercio | null;
  addItem: (item: Omit<CartItem, "cantidad">, comercio: CartComercio) => AddResult;
  removeItem: (productoId: string) => void;
  updateQuantity: (productoId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [comercio, setComercio] = useState<CartComercio | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback(
    (item: Omit<CartItem, "cantidad">, nuevoComercio: CartComercio): AddResult => {
      if (comercio && comercio.id !== nuevoComercio.id) {
        return "wrong_comercio";
      }
      if (item.stock === 0) {
        return "no_stock";
      }

      setComercio(nuevoComercio);
      setItems((prev) => {
        const existing = prev.find((i) => i.productoId === item.productoId);
        if (existing) {
          return prev.map((i) => {
            if (i.productoId !== item.productoId) return i;
            const maxQty = i.stock !== null ? i.stock : 99;
            return { ...i, cantidad: Math.min(i.cantidad + 1, maxQty) };
          });
        }
        return [...prev, { ...item, cantidad: 1 }];
      });

      return "added";
    },
    [comercio]
  );

  const removeItem = useCallback((productoId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productoId !== productoId);
      if (next.length === 0) setComercio(null);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productoId: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.productoId !== productoId) return i;
        const maxQty = i.stock !== null ? i.stock : 99;
        const next = Math.max(1, Math.min(i.cantidad + delta, maxQty));
        return { ...i, cantidad: next };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setComercio(null);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        items,
        comercio,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        isOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
