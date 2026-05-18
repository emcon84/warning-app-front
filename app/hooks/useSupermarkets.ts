"use client";

import { useQuery } from "./useQuery";
import type { QueryResult } from "./useQuery";
import { getSupermarkets } from "../lib/api/supermarkets";
import type { Supermarket } from "../lib/types/supermarket";

export function useSupermarkets(): QueryResult<Supermarket[]> {
  return useQuery(() => getSupermarkets());
}
