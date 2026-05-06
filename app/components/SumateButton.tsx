"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { BellPlus, BellRing } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Props {
  slug: string;
  isDark?: boolean;
}

export default function SumateButton({ slug, isDark: _isDark }: Props) {
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/comercios/${slug}/sumate`)
      .then(r => r.json())
      .then(data => {
        setSubscribed(!!data.subscribed);
        setCount(data.count ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleClick() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const method = subscribed ? "DELETE" : "POST";
      const res = await fetch(`${API}/api/sumate`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      setSubscribed(!subscribed);
      setCount(data.count ?? count);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      {subscribed ? (
        <button
          onClick={handleClick}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400 font-semibold text-sm transition-all active:scale-95 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <BellRing className="w-4 h-4" />
          Conectado
        </button>
      ) : (
        <button
          onClick={handleClick}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm transition-all active:scale-95 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <BellPlus className="w-4 h-4" />
          Sumate
        </button>
      )}
      {count > 0 && (
        <p className="text-xs text-center text-gray-400 mt-1">{count} conectados</p>
      )}
    </div>
  );
}
