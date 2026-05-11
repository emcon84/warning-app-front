"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface ConfirmDeleteButtonProps {
  onConfirm: () => void;
  isDark: boolean;
  size?: "sm" | "md";
  label?: string;
}

export function ConfirmDeleteButton({
  onConfirm,
  isDark,
  size = "sm",
  label = "Confirmar",
}: ConfirmDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);

  const iconSize = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  const btnBase = size === "md" ? "p-2" : "p-1.5";

  if (confirming) {
    return (
      <div className="flex gap-1">
        <button
          onClick={() => { onConfirm(); setConfirming(false); }}
          className="text-xs px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors whitespace-nowrap"
        >
          {label}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
            isDark
              ? "border-gray-700 text-gray-400 hover:bg-gray-800"
              : "border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className={`${btnBase} rounded-lg border transition-colors ${
        isDark
          ? "border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-800"
          : "border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"
      }`}
    >
      <Trash2 className={iconSize} />
    </button>
  );
}
