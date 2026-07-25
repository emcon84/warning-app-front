"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track home page for now
    const isHome = pathname === "/home" || pathname.startsWith("/home");
    if (!isHome) return;

    const section = "home";
    const sessionId = localStorage.getItem("visitor_id") || crypto.randomUUID();

    try {
      localStorage.setItem("visitor_id", sessionId);
      const img = new Image();
      img.src = `${API_URL}/api/pixel?section=home&s=${encodeURIComponent(sessionId)}&_=${Date.now()}`;
    } catch {}
  }, [pathname]);

  return null;
}
