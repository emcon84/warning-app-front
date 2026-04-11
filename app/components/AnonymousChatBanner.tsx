"use client";

import { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import Link from "next/link";

const SESSION_KEY = "anon-banner-dismissed";

export default function AnonymousChatBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed top-[6.5rem] left-0 right-0 z-40 px-4">
      <div className="max-w-xl mx-auto flex items-center gap-3 bg-blue-950/60 border border-blue-800 rounded-xl px-4 py-2.5">
        <UserPlus className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <p className="flex-1 text-xs text-blue-200">
          Queres guardar tus chats y ver tus favoritos?
        </p>
        <Link
          href="/sign-up"
          className="flex-shrink-0 text-xs font-semibold text-blue-400 hover:text-blue-300 border border-blue-700 rounded-lg px-2.5 py-1 transition-colors"
        >
          Crear cuenta gratis
        </Link>
        <button
          onClick={dismiss}
          className="flex-shrink-0 text-blue-500 hover:text-blue-300 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
