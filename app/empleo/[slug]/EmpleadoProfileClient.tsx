"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { MessageCircle, Phone, MapPin, CheckCircle, ArrowLeft, Pencil } from "lucide-react";
import { Empleado } from "../../types";
import Navbar from "../../components/Navbar";
import { useTheme } from "../../contexts/ThemeContext";

import { API_URL } from "../../lib/api/client";

function getOrCreateClientToken(): string {
  if (typeof window === "undefined") return "";
  let token = localStorage.getItem("clientToken");
  if (!token) {
    token = `client_${crypto.randomUUID()}`;
    localStorage.setItem("clientToken", token);
  }
  return token;
}

interface ContactModalProps {
  empleado: Empleado;
  isDark: boolean;
  onClose: () => void;
  onSent: (convId: string) => void;
}

function ContactModal({ empleado, isDark, onClose, onSent }: ContactModalProps) {
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500";
  const labelClass = isDark ? "text-gray-300" : "text-gray-700";

  async function handleSend() {
    if (!mensaje.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const clientToken = getOrCreateClientToken();
      const res = await fetch(`${API_URL}/api/empleados/${empleado.slug}/conversaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientToken, clientName: nombre.trim() || undefined, mensaje: mensaje.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al enviar mensaje");
      }
      const data = await res.json();
      onSent(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-2xl border p-6 ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200 shadow-xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
          Contactar a {empleado.nombre}
        </h3>
        <p className={`text-sm mb-5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Tu mensaje le llegara directamente.
        </p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={`text-sm font-medium ${labelClass}`}>Tu nombre (opcional)</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Como te llamas?"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={`text-sm font-medium ${labelClass}`}>Mensaje *</label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder={`Hola ${empleado.nombre}, vi tu perfil y me interesa contactarte...`}
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors resize-none ${inputClass}`}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={!mensaje.trim() || loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
            >
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmpleadoProfileClient({ empleado, slug }: { empleado: Empleado; slug: string }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [sentConvId, setSentConvId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    // Verificar si el usuario logueado es el dueño del perfil
    getToken().then(async (token) => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/empleados/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setIsOwner(data.slug === slug);
        }
      } catch {}
    });
  }, [isLoaded, user, slug]);

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";

  function handleContactSent(convId: string) {
    setShowModal(false);
    setSentConvId(convId);
  }

  return (
    <div className={`min-h-screen pb-40 md:pb-0 ${bg}`}>
      <Navbar totalReports={0} onMenuClick={() => {}} sidebarDisabled mapView="profesionales" />
      {showModal && (
        <ContactModal
          empleado={empleado}
          isDark={isDark}
          onClose={() => setShowModal(false)}
          onSent={handleContactSent}
        />
      )}

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => router.push("/profesionales")}
          className={`flex items-center gap-2 mb-6 text-sm ${textSec} hover:text-blue-400 transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al buscador
        </button>

        {/* Header card */}
        <div className={`rounded-2xl border p-6 mb-4 ${cardBg}`}>
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
              {empleado.foto
                ? <img src={empleado.foto} alt={empleado.nombre} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 text-3xl font-bold text-white">
                    {empleado.nombre[0].toUpperCase()}
                  </div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {empleado.nombre} {empleado.apellido}
                </h1>
                {isOwner && (
                  <Link
                    href="/empleo/editar"
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? "bg-gray-800 text-gray-400 hover:text-white" : "bg-gray-100 text-gray-500 hover:text-gray-900"}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
              <span className={`inline-block mt-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${
                empleado.disponible
                  ? "bg-green-900/40 text-green-400 border-green-800"
                  : isDark ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-400 border-gray-200"
              }`}>
                {empleado.disponible ? "Disponible" : "No disponible"}
              </span>
              {empleado.barrio && (
                <div className={`flex items-center gap-1.5 mt-2 text-sm ${textSec}`}>
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{empleado.barrio}, Reconquista</span>
                </div>
              )}
            </div>
          </div>

          {/* Descripcion */}
          {empleado.descripcion && (
            <p className={`mt-5 text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {empleado.descripcion}
            </p>
          )}

          {/* Habilidades */}
          <div className="mt-5">
            <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${textSec}`}>Habilidades</p>
            <div className="flex flex-wrap gap-2">
              {empleado.habilidades.map((h) => (
                <span key={h} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                  isDark ? "bg-blue-900/30 text-blue-300 border-blue-800" : "bg-blue-50 text-blue-700 border-blue-200"
                }`}>{h}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Mensaje enviado con exito */}
        {sentConvId && (
          <div className={`rounded-2xl border p-5 mb-4 ${isDark ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"}`}>
            <div className="flex items-start gap-3">
              <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? "text-green-400" : "text-green-600"}`} />
              <div>
                <p className={`font-semibold text-sm mb-1 ${isDark ? "text-green-300" : "text-green-800"}`}>Mensaje enviado</p>
                <p className={`text-xs ${isDark ? "text-green-400" : "text-green-700"}`}>
                  {empleado.nombre} recibio tu mensaje. Si no responde en 24 horas, podras contactarlo por WhatsApp.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          {!sentConvId && (
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm transition-colors shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Contactar por chat
            </button>
          )}

          {/* WhatsApp — solo si hay numero y ya se envio mensaje (o no hay chat disponible) */}
          {empleado.whatsapp && sentConvId && (
            <a
              href={`https://wa.me/549${empleado.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${empleado.nombre}, vi tu perfil en Reportes Reconquista y me gustaría contactarte.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-colors ${isDark ? "bg-gray-800 text-green-400 hover:bg-gray-700 border border-gray-700" : "bg-white text-green-700 hover:bg-gray-50 border border-gray-200 shadow-sm"}`}
            >
              <Phone className="w-5 h-5" />
              Contactar por WhatsApp
            </a>
          )}
        </div>

        {/* Info footer */}
        <p className={`text-xs text-center mt-6 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
          Perfil publicado en Reportes Reconquista
        </p>
      </div>
    </div>
  );
}
