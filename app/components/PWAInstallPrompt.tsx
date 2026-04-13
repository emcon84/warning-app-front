"use client";

import { useEffect, useState } from "react";
import { Download, Share, X, Smartphone } from "lucide-react";

const STORAGE_KEY = "pwa-install-dismissed";

type Platform = "android" | "ios" | "other";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

function isRunningAsPWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod|android/i.test(navigator.userAgent);
}

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // No mostrar si ya está instalada o en desktop
    if (isRunningAsPWA() || !isMobile()) return;

    // No mostrar si ya la dismisseó
    if (localStorage.getItem(STORAGE_KEY)) return;

    const plat = detectPlatform();
    setPlatform(plat);

    if (plat === "android") {
      // Capturar el evento nativo antes de que el browser lo muestre
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShow(true);
      };
      window.addEventListener("beforeinstallprompt", handler);

      // Si el evento ya se disparó antes de que montáramos (poco probable),
      // mostrar de todas formas con instrucciones manuales
      const timer = setTimeout(() => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setShow(true);
        }
      }, 3000);

      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(timer);
      };
    }

    if (plat === "ios") {
      // iOS: siempre mostramos instrucciones manuales
      const timer = setTimeout(() => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setShow(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        dismiss();
      }
    } finally {
      setInstalling(false);
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center px-4 pb-6 pointer-events-none">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl pointer-events-auto animate-slide-up">

        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Instalar la app</p>
              <p className="text-xs text-gray-400">Reportes Reconquista</p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pb-4">
          {platform === "android" && deferredPrompt && (
            <>
              <p className="text-sm text-gray-300 mb-4">
                Agregá la app a tu pantalla de inicio para acceder más rápido, sin abrir el browser.
              </p>
              <button
                onClick={handleInstall}
                disabled={installing}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {installing ? "Instalando..." : "Instalar ahora"}
              </button>
            </>
          )}

          {platform === "android" && !deferredPrompt && (
            <>
              <p className="text-sm text-gray-300 mb-3">
                Para instalar la app en Android:
              </p>
              <ol className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  Tocá el menú <span className="font-semibold mx-1">⋮</span> del browser
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  Seleccioná <span className="font-semibold ml-1">"Agregar a pantalla de inicio"</span>
                </li>
              </ol>
            </>
          )}

          {platform === "ios" && (
            <>
              <p className="text-sm text-gray-300 mb-3">
                Para instalar en iPhone o iPad:
              </p>
              <ol className="space-y-2.5 mb-4">
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>Tocá el botón <Share className="w-4 h-4 inline mx-1 text-blue-400" /> de compartir en Safari</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  Deslizá y tocá <span className="font-semibold ml-1">"Agregar a pantalla de inicio"</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  Tocá <span className="font-semibold ml-1">"Agregar"</span>
                </li>
              </ol>
            </>
          )}

          <button
            onClick={dismiss}
            className="w-full py-2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
          >
            No mostrar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
}
