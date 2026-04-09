"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { Supermarket } from "../types";
import { getSupermarkets, createSupermarket, deleteSupermarket } from "../utils/api";

interface OfertasViewProps {
  isVisible: boolean;
}

export default function OfertasView({ isVisible }: OfertasViewProps) {
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Supermarket | null>(null);

  const fetchSupermarkets = () => {
    setLoading(true);
    getSupermarkets()
      .then(setSupermarkets)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isVisible) return;
    fetchSupermarkets();

    // Re-fetch al volver de otra página (Next.js restaura el estado del cache)
    const onVisible = () => { if (!document.hidden) fetchSupermarkets(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isVisible]);

  if (!isVisible) return null;

  const handleAddSupermarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const created = await createSupermarket({ name: newName.trim(), address: newAddress.trim() });
      setSupermarkets((prev) => [...prev, created]);
      setNewName("");
      setNewAddress("");
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (supermarket: Supermarket, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(supermarket);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    setConfirmDelete(null);
    try {
      await deleteSupermarket(confirmDelete.id);
      setSupermarkets((prev) => prev.filter((s) => s.id !== confirmDelete.id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm";

  return (
    <div className="fixed inset-0 z-[900] bg-gray-50 dark:bg-gray-950 flex flex-col" style={{ top: 60 }}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ofertas del día</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Reconquista</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar super
        </button>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        ) : supermarkets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400 dark:text-gray-600">
            <ShoppingCart className="w-12 h-12" />
            <p className="text-sm font-medium">Todavía no hay supermercados.</p>
            <p className="text-xs text-center">Tocá "Agregar super" para sumar el primero.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {supermarkets.map((supermarket) => (
              <div key={supermarket.id} className="relative group">
                <Link
                  href={`/ofertas/${supermarket.id}`}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm text-left flex flex-col items-center gap-3 hover:border-green-400 dark:hover:border-green-600 transition-colors active:scale-95 block"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    {supermarket.logo ? (
                      <img src={supermarket.logo} alt={supermarket.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                        {supermarket.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{supermarket.name}</p>
                    {(supermarket.offerCount ?? 0) > 0 ? (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-bold">
                        {supermarket.offerCount} oferta{supermarket.offerCount !== 1 ? "s" : ""} →
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">😔 Sin ofertas</p>
                    )}
                  </div>
                </Link>
                <button
                  onClick={(e) => handleDeleteClick(supermarket, e)}
                  disabled={deletingId === supermarket.id}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-all disabled:opacity-50"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal agregar supermercado */}
      {isAddOpen && (
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center p-4"
          style={{ zIndex: 1200, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Agregar supermercado</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAddSupermarket} className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Super Reconquista - Centro"
                  className={inputClass}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Dirección
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Ej: Mitre 480"
                  className={inputClass}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {confirmDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 1300, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white text-center mb-1">
              Eliminar supermercado
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              ¿Eliminás <span className="font-semibold text-gray-900 dark:text-white">{confirmDelete.name}</span> y todas sus ofertas? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
