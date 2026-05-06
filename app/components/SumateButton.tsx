"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { BellPlus, BellRing, Check, ChevronRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Props {
  slug: string;
  isDark?: boolean;
}

export default function SumateButton({ slug, isDark }: Props) {
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }
      try {
        const token = await getToken();
        const res = await fetch(`${API}/api/comercios/${slug}/sumate`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setSubscribed(!!data.subscribed);
        setCount(data.count ?? 0);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    checkSubscription();
  }, [slug, isSignedIn, getToken]);

  async function handleClick() {
    if (!isSignedIn) { router.push("/sign-in"); return; }
    setLoading(true);
    try {
      const token = await getToken();
      const method = subscribed ? "DELETE" : "POST";
      const res = await fetch(`${API}/api/comercios/${slug}/sumate`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubscribed(data.subscribed);
      setCount(data.count ?? count);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={`mt-2 w-full h-16 rounded-2xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
    );
  }

  if (subscribed) {
    return (
      <button
        onClick={handleClick}
        className={`mt-2 w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98] ${isDark ? "bg-green-900/20 border border-green-800/50" : "bg-green-50 border border-green-200"}`}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-green-900/40" : "bg-green-100"}`}>
          <BellRing className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex-1 text-left">
          <p className={`text-sm font-bold ${isDark ? "text-green-400" : "text-green-700"}`}>Conectado</p>
          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Recibirás novedades de este comercio{count > 1 ? ` · ${count} conectados` : ""}
          </p>
        </div>
        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`mt-2 w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-dashed transition-all active:scale-[0.98] ${isDark ? "border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/5" : "border-amber-400/40 hover:border-amber-500/60 hover:bg-amber-50"}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-amber-500/15" : "bg-amber-100"}`}>
        <BellPlus className="w-5 h-5 text-amber-500" />
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Sumate</p>
        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Recibí todas las novedades, ofertas y sorteos{count > 0 ? ` · ${count} conectados` : ""}
        </p>
      </div>
      <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-amber-500" : "text-amber-500"}`} />
    </button>
  );
}
