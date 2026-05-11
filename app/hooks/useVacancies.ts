"use client";

import { useQuery } from "./useQuery";
import type { QueryResult } from "./useQuery";
import { getVacancies, getVacancy } from "../lib/api/vacancies";
import type { Vacante } from "../lib/types/vacancy";

export function useVacancies(filters?: {
  barrio?: string;
  habilidad?: string;
}): QueryResult<Vacante[]> {
  return useQuery(() => getVacancies(filters), [filters?.barrio, filters?.habilidad]);
}

export function useVacancy(id: string): QueryResult<Vacante> {
  return useQuery(() => getVacancy(id), [id]);
}
