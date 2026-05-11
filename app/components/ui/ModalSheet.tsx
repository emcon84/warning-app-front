"use client";

import { X } from "lucide-react";

interface ModalSheetProps {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  isDark?: boolean;
}

export function ModalSheet({
  title,
  onClose,
  children,
  footer,
  maxWidth = "max-w-lg",
  isDark = false,
}: ModalSheetProps) {
  const bg = isDark ? "bg-gray-900" : "bg-white";
  const titleColor = isDark ? "text-white" : "text-gray-900";
  const borderColor = isDark ? "border-gray-800" : "border-gray-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pt-20 pb-24 sm:p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl ${bg} shadow-xl flex flex-col`}
        style={{ maxHeight: "calc(100dvh - 10rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {title !== undefined && (
          <div className="flex items-center justify-between p-5 pb-0 flex-shrink-0">
            <h2 className={`font-bold text-base ${titleColor}`}>{title}</h2>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4 overflow-y-auto p-5 flex-1">
          {children}
        </div>

        {footer && (
          <div className={`flex gap-3 p-5 pt-3 flex-shrink-0 border-t ${borderColor}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
