"use client";

import { useQuery } from "./useQuery";
import type { QueryResult } from "./useQuery";
import { getDoctors, getDoctor } from "../lib/api/doctors";
import type { Doctor, DoctorFilters } from "../lib/types/doctor";

export function useDoctors(filters?: DoctorFilters): QueryResult<Doctor[]> {
  return useQuery(() => getDoctors(filters), [
    filters?.especialidad,
    filters?.obraSocial,
    filters?.ciudad,
  ]);
}

export function useDoctor(id: string): QueryResult<Doctor> {
  return useQuery(() => getDoctor(id), [id]);
}
