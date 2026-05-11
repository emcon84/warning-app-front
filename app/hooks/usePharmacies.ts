"use client";

import { useQuery } from "./useQuery";
import type { QueryResult } from "./useQuery";
import { getPharmacies, getPharmacyOnDuty } from "../lib/api/pharmacies";
import type { Farmacia, TurnoResponse } from "../lib/types/pharmacy";

export function usePharmacies(): QueryResult<Farmacia[]> {
  return useQuery(() => getPharmacies());
}

export function usePharmacyOnDuty(): QueryResult<TurnoResponse> {
  return useQuery(() => getPharmacyOnDuty());
}
