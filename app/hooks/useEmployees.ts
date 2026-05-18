"use client";

import { useQuery } from "./useQuery";
import type { QueryResult } from "./useQuery";
import { getEmployees, getEmployee } from "../lib/api/employees";
import type { Empleado } from "../lib/types/employee";

export function useEmployees(filters?: {
  barrio?: string;
  habilidad?: string;
}): QueryResult<Empleado[]> {
  return useQuery(() => getEmployees(filters), [filters?.barrio, filters?.habilidad]);
}

export function useEmployee(slug: string): QueryResult<Empleado> {
  return useQuery(() => getEmployee(slug), [slug]);
}
