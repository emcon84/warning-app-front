"use client";

import { useQuery } from "./useQuery";
import type { QueryResult } from "./useQuery";
import { getNews } from "../lib/api/reconquistanews";
import type { NewsArticle } from "../lib/types/reconquistanews";

const REFETCH_MS = 5 * 60 * 1000;

export function useReconquistaNews(portal?: string): QueryResult<NewsArticle[]> {
  return useQuery(() => getNews(portal), [portal], REFETCH_MS);
}
