"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store, MapPin, Clock, Phone, Star, Bell, ShoppingCart,
  Package, Plus, Trash2, Pencil, X, Check,
  ChevronRight, BarChart2, Megaphone, Tag, Eye,
  MessageCircle, ExternalLink, ArrowLeft,
} from "lucide-react";
import type { Producto, ComercioOffer, ComercioPost } from "../types";
import { DEMO_COMERCIO, DEMO_SLUG } from "../../mocks/data";
import { buildDemoTour, type DemoTab } from "./tour";
import "driver.js/dist/driver.css";

import { API_URL } from "../lib/api/client";

function WaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

// ── Modal Producto ────────────────────────────────────────────────────────────

function ProductoModal({ onClose, onSaved }: { onClose: () => void; onSaved: (p: Producto) => void }) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/comercios/me/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer demo-token" },
      body: JSON.stringify({ nombre: nombre.trim(), precio: precio.trim() || null, descripcion: descripcion.trim() || null, tipo: "producto" }),
    });
    const data = await res.json();
    onSaved(data);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" data-tour="producto-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">Nuevo producto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide block mb-1.5">Nombre del producto *</label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Remera básica premium"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide block mb-1.5">Precio</label>
            <input
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              placeholder="Ej: $18.500"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide block mb-1.5">Descripción</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Descripción opcional del producto..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-700 text-gray-400 rounded-xl text-sm hover:border-gray-600 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving || !nombre.trim()} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</> : <><Check className="w-4 h-4" /> Guardar</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Modal Post ────────────────────────────────────────────────────────────────

const TIPOS_POST = [
  { value: "oferta", label: "🏷️ Oferta", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { value: "novedad", label: "📢 Novedad", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { value: "sorteo", label: "🎁 Sorteo", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
] as const;

function PostModal({ onClose, onSaved }: { onClose: () => void; onSaved: (p: ComercioPost) => void }) {
  const [tipo, setTipo] = useState<"oferta" | "novedad" | "sorteo">("oferta");
  const [contenido, setContenido] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!contenido.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/comercios/${DEMO_SLUG}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer demo-token" },
      body: JSON.stringify({ tipo, contenido: contenido.trim() }),
    });
    const data = await res.json();
    onSaved(data);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" data-tour="post-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">Nueva publicación</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide block mb-1.5">Tipo</label>
            <div className="flex gap-2">
              {TIPOS_POST.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTipo(t.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${tipo === t.value ? t.color : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide block mb-1.5">Contenido *</label>
            <textarea
              value={contenido}
              onChange={e => setContenido(e.target.value)}
              placeholder="Escribí tu publicación aquí..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 resize-none"
              required
            />
            <p className="text-gray-600 text-xs mt-1">{contenido.length} / 500</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-700 text-gray-400 rounded-xl text-sm hover:border-gray-600 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving || !contenido.trim()} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publicando...</> : <><Megaphone className="w-4 h-4" /> Publicar</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Modal Oferta ──────────────────────────────────────────────────────────────

function OfertaModal({ onClose, onSaved }: { onClose: () => void; onSaved: (o: ComercioOffer) => void }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/comercios/me/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer demo-token" },
      body: JSON.stringify({ titulo: titulo.trim(), descripcion: descripcion.trim() || null }),
    });
    const data = await res.json();
    onSaved(data);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">Nueva oferta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide block mb-1.5">Título *</label>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: 30% off en toda la colección" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500" required />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide block mb-1.5">Descripción</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Detalles de la oferta..." rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-700 text-gray-400 rounded-xl text-sm hover:border-gray-600 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving || !titulo.trim()} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {saving ? "Guardando..." : <><Tag className="w-4 h-4" /> Crear oferta</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Tab Perfil ────────────────────────────────────────────────────────────────

function TabPerfil({ sumado, onSumate }: { sumado: boolean; onSumate: () => void }) {
  const c = DEMO_COMERCIO;
  return (
    <div className="space-y-4">
      <div data-tour="perfil-header" className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-gray-900 relative">
          <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-2xl bg-gray-800 border-2 border-gray-700 flex items-center justify-center shadow-xl">
            <Store className="w-7 h-7 text-indigo-400" />
          </div>
        </div>
        <div className="pt-8 px-4 pb-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-white font-black text-xl">{c.nombre}</h2>
              <p className="text-indigo-400 text-sm">{c.rubro}</p>
            </div>
            <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 text-sm font-bold">{c.ratingAvg}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-3">{c.descripcion}</p>
          <div className="space-y-1.5 mb-3">
            {c.direccion && <div className="flex items-center gap-2 text-gray-400 text-sm"><MapPin className="w-4 h-4 flex-shrink-0 text-gray-500" />{c.direccion}</div>}
            {c.horario && <div className="flex items-center gap-2 text-gray-400 text-sm"><Clock className="w-4 h-4 flex-shrink-0 text-gray-500" />{c.horario}</div>}
            {c.telefono && <div className="flex items-center gap-2 text-gray-400 text-sm"><Phone className="w-4 h-4 flex-shrink-0 text-gray-500" />{c.telefono}</div>}
          </div>
          <div className="flex gap-1 flex-wrap mb-4">
            {c.isFounder && <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">★ FOUNDER</span>}
            <span className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-400">{c._count?.suscriptores} seguidores</span>
          </div>
          <a
            data-tour="whatsapp-btn"
            href={`https://wa.me/${c.whatsapp}?text=Hola!%20Te%20contacto%20desde%20la%20app.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
            style={{ background: "#25D366" }}
          >
            <WaIcon className="w-5 h-5" />
            Contactar por WhatsApp
          </a>
        </div>
      </div>

      <button
        data-tour="sumate-btn"
        onClick={onSumate}
        className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${sumado ? "bg-amber-500/10 border-amber-500/50" : "bg-gray-900 border-gray-800 hover:border-amber-500/40"}`}
      >
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Bell className={`w-5 h-5 ${sumado ? "text-amber-400 fill-amber-400" : "text-amber-400"}`} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-white font-bold text-sm">{sumado ? "Te sumaste ✓" : "Sumate"}</p>
          <p className="text-gray-400 text-xs">{sumado ? "Vas a recibir todas las novedades" : "Recibí todas las novedades, ofertas y sorteos"}</p>
        </div>
        {!sumado && <ChevronRight className="w-4 h-4 text-amber-400" />}
      </button>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">Productos destacados</p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_COMERCIO.productos.slice(0, 3).map((p) => (
            <div key={p.id} className="bg-gray-800 rounded-xl p-2 text-center">
              <div className="h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-2">
                <Package className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-white text-[10px] font-bold leading-tight line-clamp-2">{p.nombre}</p>
              {p.precio && <p className="text-green-400 text-[10px] font-black mt-0.5">{p.precio}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab Catálogo ──────────────────────────────────────────────────────────────

function TabCatalogo({
  productos, onAdd, onDelete,
}: {
  productos: Producto[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold">Catálogo de productos</p>
          <p className="text-gray-400 text-xs">{productos.length} productos</p>
        </div>
        <button data-tour="add-producto-btn" onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      <div data-tour="productos-list" className="space-y-2">
        {productos.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl border border-dashed border-gray-700 p-8 text-center">
            <Package className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Todavía no tenés productos</p>
            <p className="text-gray-600 text-xs mt-1">Tocá "Agregar" para empezar</p>
          </div>
        ) : (
          productos.map(p => (
            <div key={p.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-3 flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{p.nombre}</p>
                <div className="flex items-center gap-2">
                  {p.precio && <span className="text-green-400 text-xs font-bold">{p.precio}</span>}
                  {p.tipo && <span className="text-gray-500 text-xs capitalize">{p.tipo}</span>}
                </div>
                {p.descripcion && <p className="text-gray-500 text-xs truncate mt-0.5">{p.descripcion}</p>}
              </div>
              <button onClick={() => onDelete(p.id)} className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Tab Publicaciones ─────────────────────────────────────────────────────────

const TIPO_META: Record<string, { emoji: string; label: string; cls: string }> = {
  oferta:   { emoji: "🏷️", label: "Oferta",   cls: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  novedad:  { emoji: "📢", label: "Novedad",  cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  sorteo:   { emoji: "🎁", label: "Sorteo",   cls: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
};

function TabPublicaciones({ posts, onAdd, onDelete }: { posts: ComercioPost[]; onAdd: () => void; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold">Publicaciones</p>
          <p className="text-gray-400 text-xs">{posts.length} publicaciones</p>
        </div>
        <button data-tour="add-post-btn" onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Publicar
        </button>
      </div>

      <div data-tour="posts-list" className="space-y-3">
        {posts.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl border border-dashed border-gray-700 p-8 text-center">
            <Megaphone className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Todavía no publicaste nada</p>
            <p className="text-gray-600 text-xs mt-1">Tocá "Publicar" para crear tu primera publicación</p>
          </div>
        ) : (
          posts.map(p => {
            const meta = TIPO_META[p.tipo] ?? TIPO_META.novedad;
            return (
              <div key={p.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${meta.cls}`}>{meta.emoji} {meta.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">{p.likes ?? 0} ♡</span>
                    <button onClick={() => onDelete(p.id)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-white text-sm leading-relaxed">{p.contenido}</p>
                <p className="text-gray-600 text-xs mt-2">{new Date(p.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Tab Ofertas ───────────────────────────────────────────────────────────────

function TabOfertas({ offers, onAdd, onDelete }: { offers: ComercioOffer[]; onAdd: () => void; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold">Ofertas destacadas</p>
          <p className="text-gray-400 text-xs">{offers.filter(o => o.activa).length} activas</p>
        </div>
        <button data-tour="add-oferta-btn" onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-sm rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>

      <div data-tour="ofertas-list" className="space-y-3">
        {offers.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl border border-dashed border-gray-700 p-8 text-center">
            <Tag className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Todavía no creaste ofertas</p>
          </div>
        ) : (
          offers.map(o => (
            <div key={o.id} className="bg-gray-900 rounded-2xl border border-amber-500/20 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${o.activa ? "bg-green-400" : "bg-gray-600"}`} />
                    <p className="text-white font-semibold text-sm">{o.titulo}</p>
                  </div>
                  {o.descripcion && <p className="text-gray-400 text-xs leading-relaxed">{o.descripcion}</p>}
                  {o.validaHasta && <p className="text-amber-400 text-xs mt-1.5">Válida hasta {new Date(o.validaHasta).toLocaleDateString("es-AR")}</p>}
                </div>
                <button onClick={() => onDelete(o.id)} className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Tab Estadísticas ──────────────────────────────────────────────────────────

function TabEstadisticas() {
  const stats = [
    { label: "Visitas este mes", value: "142", icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Clics en WhatsApp", value: "18", icon: MessageCircle, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Recomendaciones", value: "7", icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Seguidores", value: "23", icon: Bell, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div data-tour="stats-panel" className="space-y-4">
      <div>
        <p className="text-white font-bold mb-1">Estadísticas</p>
        <p className="text-gray-400 text-xs">Últimos 30 días</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-gray-400 text-xs mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">Comparativa mensual</p>
        <div className="space-y-2.5">
          {[
            { label: "Visitas", este: 142, anterior: 98 },
            { label: "Clics WA", este: 18, anterior: 11 },
          ].map(m => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{m.label}</span>
                <span className="text-green-400 font-semibold">+{Math.round((m.este - m.anterior) / m.anterior * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(m.este / 200) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-2xl p-4">
        <p className="text-indigo-300 text-sm font-bold mb-1">💡 Consejo</p>
        <p className="text-indigo-300/70 text-xs leading-relaxed">
          Tu horario pico de visitas es entre las 12 y las 14hs. Publicá ofertas antes de ese rango para maximizar el alcance.
        </p>
      </div>
    </div>
  );
}

// ── Main DemoApp ──────────────────────────────────────────────────────────────

const TABS: { id: DemoTab; label: string; icon: React.ElementType }[] = [
  { id: "perfil",         label: "Perfil",         icon: Store },
  { id: "catalogo",       label: "Catálogo",        icon: Package },
  { id: "publicaciones",  label: "Publicaciones",   icon: Megaphone },
  { id: "ofertas",        label: "Ofertas",          icon: Tag },
  { id: "estadisticas",  label: "Estadísticas",    icon: BarChart2 },
];

export default function DemoApp() {
  const [tab, setTab] = useState<DemoTab>("perfil");
  const [productos, setProductos] = useState<Producto[]>(DEMO_COMERCIO.productos);
  const [posts, setPosts] = useState<ComercioPost[]>([]);
  const [offers, setOffers] = useState<ComercioOffer[]>(DEMO_COMERCIO.offers);
  const [sumado, setSumado] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showOfertaModal, setShowOfertaModal] = useState(false);
  const tourRef = useRef<ReturnType<typeof buildDemoTour> | null>(null);

  // Cargar posts iniciales desde MSW
  useEffect(() => {
    fetch(`/api/comercios/${DEMO_SLUG}/posts`, {
      headers: { Authorization: "Bearer demo-token" },
    })
      .then(r => r.json())
      .then(data => Array.isArray(data) && setPosts(data))
      .catch(() => {});
  }, []);

  const setTabAndScroll = useCallback((t: DemoTab) => {
    setTab(t);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  function startTour() {
    if (tourRef.current) {
      tourRef.current.destroy();
    }
    tourRef.current = buildDemoTour({
      setTab: setTabAndScroll,
      openProductModal: () => setShowProductModal(true),
      openPostModal: () => setShowPostModal(true),
      openOfferModal: () => setShowOfertaModal(true),
    });
    tourRef.current.drive();
  }

  async function handleSumate() {
    if (sumado) return;
    await fetch(`/api/comercios/${DEMO_SLUG}/sumate`, {
      method: "POST",
      headers: { Authorization: "Bearer demo-token" },
    });
    setSumado(true);
  }

  async function handleDeleteProducto(id: string) {
    await fetch(`/api/comercios/me/productos/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer demo-token" },
    });
    setProductos(prev => prev.filter(p => p.id !== id));
  }

  async function handleDeletePost(id: string) {
    await fetch(`/api/comercios/${DEMO_SLUG}/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer demo-token" },
    });
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  async function handleDeleteOferta(id: string) {
    await fetch(`/api/comercios/me/offers/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer demo-token" },
    });
    setOffers(prev => prev.filter(o => o.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/para-comercios" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm">Demo Interactiva</span>
            </div>
            <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">DEMO</span>
          </div>
          <button
            onClick={startTour}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Iniciar tour
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-14 z-20 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-0.5 py-2" style={{ width: "max-content" }}>
            {TABS.map(t => (
              <button
                key={t.id}
                data-tour={`tab-${t.id}`}
                onClick={() => setTabAndScroll(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  tab === t.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "perfil"        && <TabPerfil sumado={sumado} onSumate={handleSumate} />}
            {tab === "catalogo"      && <TabCatalogo productos={productos} onAdd={() => setShowProductModal(true)} onDelete={handleDeleteProducto} />}
            {tab === "publicaciones" && <TabPublicaciones posts={posts} onAdd={() => setShowPostModal(true)} onDelete={handleDeletePost} />}
            {tab === "ofertas"       && <TabOfertas offers={offers} onAdd={() => setShowOfertaModal(true)} onDelete={handleDeleteOferta} />}
            {tab === "estadisticas"  && <TabEstadisticas />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* CTA fija */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gray-950/95 backdrop-blur-md border-t border-gray-800">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/comercio/nuevo"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black rounded-2xl transition-colors text-sm"
          >
            Registrar mi comercio gratis <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showProductModal && (
          <ProductoModal
            onClose={() => setShowProductModal(false)}
            onSaved={p => setProductos(prev => [...prev, p])}
          />
        )}
        {showPostModal && (
          <PostModal
            onClose={() => setShowPostModal(false)}
            onSaved={p => setPosts(prev => [p, ...prev])}
          />
        )}
        {showOfertaModal && (
          <OfertaModal
            onClose={() => setShowOfertaModal(false)}
            onSaved={o => setOffers(prev => [...prev, o])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
