"use client";

import { useQuery } from "./useQuery";
import type { QueryResult } from "./useQuery";
import { getStats } from "../lib/api/stats";

export function useStats(): QueryResult<Record<string, unknown>> {
  return useQuery<Record<string, unknown>>(() => getStats());
}
