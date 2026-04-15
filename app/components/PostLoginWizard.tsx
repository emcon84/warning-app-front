"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Wrench, Store, Map, ArrowRight, X } from "lucide-react";

const STORAGE_KEY = "wizard-done";
const EXCLUDED_PATHS = ["/profesional/nuevo", "/comercio/nuevo", "/sign-in", "/sign-up", "/admin", "/mi-perfil"];

export default function PostLoginWizard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    setVisible(true);
  }, [isLoaded, user, pathname]);

  function handleProfesional() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    router.push("/profesional/nuevo");
  }

  function handleComercio() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    router.push("/comercio/nuevo");
  }

  function handleExplorar() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  const nombre = user?.firstName || user?.username || "bienvenido";

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="relative bg-gray-950 border border-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-8 pb-6 border-b border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Hola, {nombre}.</p>
              <h2 className="text-xl font-bold text-white leading-snug">
                ¿Cómo vas a usar<br />la app?
              </h2>
              <p className="text-sm text-gray-500 mt-1.5">
                Elegí tu tipo de cuenta para empezar.
              </p>
            </div>
            <button
              onClick={handleExplorar}
              className="text-gray-600 hover:text-gray-400 transition-colors mt-1 flex-shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="p-4 flex flex-col gap-3">

          {/* Profesional */}
          <button
            onClick={handleProfesional}
            className="flex items-center gap-4 p-4 rounded-2xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800/80 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-900 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">Soy profesional de oficio</p>
              <p className="text-xs text-gray-500 mt-0.5">Plomero, electricista, pintor, albanil...</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
          </button>

          {/* Comercio */}
          <button
            onClick={handleComercio}
            className="flex items-center gap-4 p-4 rounded-2xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800/80 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-900 flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">Tengo un comercio</p>
              <p className="text-xs text-gray-500 mt-0.5">Tienda, restaurante, peluqueria...</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
          </button>

          {/* Explorar */}
          <button
            onClick={handleExplorar}
            className="flex items-center gap-4 p-4 rounded-2xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800/80 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-green-950/60 border border-green-900 flex items-center justify-center flex-shrink-0">
              <Map className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">Solo quiero explorar</p>
              <p className="text-xs text-gray-500 mt-0.5">Ver el mapa, reportar problemas, buscar medicos</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
          </button>

        </div>

        <p className="text-center text-xs text-gray-600 pb-6 px-6">
          Siempre podes cambiar esto desde tu perfil.
        </p>


      </div>
    </div>
  );
}
