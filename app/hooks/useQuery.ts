"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  refetchInterval?: number
): QueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  useEffect(() => {
    if (!refetchInterval) return;
    const t = setInterval(() => {
      fetcherRef.current().then(setData).catch(() => {});
    }, refetchInterval);
    return () => clearInterval(t);
  }, [refetchInterval]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: execute };
}
