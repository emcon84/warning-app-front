"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const CHECK_INTERVAL = 30_000; // 30 segundos
const INITIAL_DELAY  = 5_000;  // esperar 5s antes del primer check (evitar falso positivo al cargar)
const TIMEOUT        = 8_000;  // 8 segundos de timeout
const FAILURES_NEEDED = 2;     // fallos consecutivos antes de mostrar banner

export type ApiStatus = "online" | "offline" | "checking";

export function useApiStatus() {
  const [status, setStatus] = useState<ApiStatus>("online"); // optimistic default
  const failuresRef = useRef(0);

  const check = useCallback(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);
      if (res.ok) {
        failuresRef.current = 0;
        setStatus("online");
      } else {
        failuresRef.current += 1;
        if (failuresRef.current >= FAILURES_NEEDED) setStatus("offline");
      }
    } catch {
      clearTimeout(timer);
      failuresRef.current += 1;
      if (failuresRef.current >= FAILURES_NEEDED) setStatus("offline");
    }
  }, []);

  useEffect(() => {
    // Delay inicial: no chequear hasta que la app esté estabilizada
    const initial = setTimeout(() => {
      check();
    }, INITIAL_DELAY);

    const interval = setInterval(check, CHECK_INTERVAL);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [check]);

  return status;
}
