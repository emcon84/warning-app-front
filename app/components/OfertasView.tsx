"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { Supermarket } from "../types";
import { getSupermarkets, createSupermarket, deleteSupermarket } from "../utils/api";
import { useTheme } from "../contexts/ThemeContext";

interface OfertasViewProps {
  isVisible: boolean;
}

export default function OfertasView({ isVisible }: OfertasViewProps) {
  const { isDark } = useTheme();
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

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const inputClass = `w-full px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm ${isDark ? "border border-gray-600 bg-gray-800 text-white placeholder:text-gray-500" : "border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"}`;

  return (
    <div className="fixed inset-0 z-[900] flex flex-col" style={{ top: 52, backgroundColor: isDark ? '#030712' : '#f9fafb' }}>
      {/* Header */}
      <div className={`flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-3 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`} style={{ backgroundColor: isDark ? '#111827' : '#ffffff' }}>
        <div>
          <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Ofertas del día</h2>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Reconquista</p>
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
          <div className={`flex flex-col items-center justify-center h-40 gap-3 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
            <ShoppingCart className="w-12 h-12" />
            <p className="text-sm font-medium">Todavía no hay supermercados.</p>
            <p className="text-xs text-center">Toca "Agregar super" para sumar el primero.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {supermarkets.map((supermarket) => (
              <div key={supermarket.id} className="relative group">
                <Link
                  href={`/ofertas/${supermarket.id}`}
                  className={`w-full rounded-2xl p-4 shadow-sm text-left flex flex-col items-center gap-3 transition-colors active:scale-95 block border ${isDark ? "bg-gray-900 border-gray-700 hover:border-green-600" : "bg-white border-gray-200 hover:border-green-400"}`}
                >
                  <div className={`w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                    {supermarket.logo ? (
                      <img src={supermarket.logo} alt={supermarket.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className={`text-2xl font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {supermarket.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-center w-full">
                    <p className={`text-sm font-semibold leading-tight mb-2 truncate w-full ${isDark ? "text-white" : "text-gray-900"}`}>{supermarket.name}</p>
                    {(supermarket.offerCount ?? 0) > 0 ? (
                      <div className="relative inline-flex items-center justify-center">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
                        <div className="relative inline-flex items-center gap-1.5 bg-green-500 text-white font-bold px-3 py-1.5 rounded-full shadow-md shadow-green-500/40">
                          <span className="text-lg font-black leading-none">{supermarket.offerCount}</span>
                          <span className="text-xs font-semibold opacity-90">oferta{supermarket.offerCount !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    ) : (
                      <div className={`inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-1 ${isDark ? "text-gray-600 bg-gray-800" : "text-gray-400 bg-gray-100"}`}>
                        <span>Sin ofertas</span>
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={(e) => handleDeleteClick(supermarket, e)}
                  disabled={deletingId === supermarket.id}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-all disabled:opacity-50"
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
            className={`rounded-2xl shadow-2xl w-full max-w-md ${isDark ? "bg-gray-900" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Agregar supermercado</h3>
              <button onClick={() => setIsAddOpen(false)} className={`p-1.5 rounded-full ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}>
                <X className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              </button>
            </div>
            <form onSubmit={handleAddSupermarket} className="px-5 py-4 space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
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
                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
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
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"}`}
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
            className={`rounded-2xl shadow-2xl w-full max-w-sm p-6 ${isDark ? "bg-gray-900" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${isDark ? "bg-red-900/30" : "bg-red-100"}`}>
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className={`text-base font-bold text-center mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
              Eliminar supermercado
            </h3>
            <p className={`text-sm text-center mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Eliminás <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{confirmDelete.name}</span> y todas sus ofertas? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"}`}
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
