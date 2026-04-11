"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const CHECK_INTERVAL = 30_000; // 30 segundos
const TIMEOUT = 5_000; // 5 segundos para considerar caida

export type ApiStatus = "online" | "offline" | "checking";

export function useApiStatus() {
  const [status, setStatus] = useState<ApiStatus>("checking");

  const check = useCallback(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);
      setStatus(res.ok ? "online" : "offline");
    } catch {
      clearTimeout(timer);
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [check]);

  return status;
}
