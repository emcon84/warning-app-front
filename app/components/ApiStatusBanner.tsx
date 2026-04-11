"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { useApiStatus } from "../hooks/useApiStatus";
import { useState } from "react";

export default function ApiStatusBanner() {
  const status = useApiStatus();
  const [dismissed, setDismissed] = useState(false);

  if (status !== "offline" || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg font-montserrat">
      <div className="flex items-center gap-2.5 min-w-0">
        <WifiOff className="w-4 h-4 shrink-0" />
        <p className="text-sm font-medium truncate">
          El servidor no responde. Algunas funciones pueden no estar disponibles.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Reintentar
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/70 hover:text-white text-lg leading-none px-1"
          aria-label="Cerrar"
        >
          x
        </button>
      </div>
    </div>
  );
}
