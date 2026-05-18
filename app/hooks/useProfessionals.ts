"use client";

import { useQuery } from "./useQuery";
import type { QueryResult } from "./useQuery";
import { getProfessionals, getProfessional } from "../lib/api/professionals";
import type { ProfessionalFilters } from "../lib/api/professionals";
import type { Professional } from "../lib/types/professional";

export function useProfessionals(filters?: ProfessionalFilters): QueryResult<Professional[]> {
  return useQuery(() => getProfessionals(filters), [
    filters?.oficio,
    filters?.barrio,
    filters?.tipo,
  ]);
}

export function useProfessional(slug: string): QueryResult<Professional> {
  return useQuery(() => getProfessional(slug), [slug]);
}
