"use client";

import { Phone, ShieldAlert } from "lucide-react";

export default function FloatingBottomNav() {
  const handleEmergencyCall = () => {
    window.location.href = "tel:911";
  };

  const handlePoliceCall = () => {
    // Número de policía local - ajustar según la localidad
    window.location.href = "tel:101";
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        {/* Botón 911 */}
        <button
          onClick={handleEmergencyCall}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          aria-label="Llamar a emergencias 911"
        >
          <Phone className="w-5 h-5" />
          <span className="hidden sm:inline">911</span>
        </button>

        {/* Botón Policía */}
        <button
          onClick={handlePoliceCall}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          aria-label="Llamar a la policía"
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="hidden sm:inline">Policía</span>
        </button>
      </div>
    </div>
  );
}
