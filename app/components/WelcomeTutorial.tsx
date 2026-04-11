"use client";

import { useState, useEffect } from "react";
import { Megaphone, Stethoscope, Wrench, X } from "lucide-react";

const STORAGE_KEY = "tutorial-done";

interface Step {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    title: "Bienvenido a Reportes Reconquista",
    description:
      "Tu app para estar conectado con tu ciudad. Reporta problemas, encontra profesionales y mucho mas.",
  },
  {
    icon: <Megaphone className="w-8 h-8 text-amber-400" />,
    title: "Reporta problemas",
    description:
      "Baches, inundaciones, cortes de luz. Marca el punto en el mapa y deja tu reporte en segundos.",
  },
  {
    icon: <Stethoscope className="w-8 h-8 text-green-400" />,
    title: "Encontra medicos y farmacias",
    description:
      "Busca medicos por especialidad y obra social. Consulta que farmacia esta de turno hoy.",
  },
  {
    icon: <Wrench className="w-8 h-8 text-blue-400" />,
    title: "Contratar profesionales",
    description:
      "Plomeros, electricistas, albaniles y mas. Contactalos directamente desde la app de forma privada.",
  },
];

export default function WelcomeTutorial() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={finish} />

      {/* Card */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        {/* Boton cerrar */}
        <button
          onClick={finish}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Cerrar tutorial"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icono */}
        {current.icon && (
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
              {current.icon}
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-white mb-2">{current.title}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">{current.description}</p>
        </div>

        {/* Dots de progreso */}
        <div className="flex justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-200 ${
                i === step ? "w-4 h-2 bg-white" : "w-2 h-2 bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Navegacion */}
        <div className="flex gap-2">
          {!isFirst && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Anterior
            </button>
          )}
          <button
            onClick={isLast ? finish : () => setStep((s) => s + 1)}
            className="flex-1 py-2.5 rounded-xl bg-white text-gray-950 font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            {isLast ? "Empezar" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}
