"use client";

import { useQuery } from "./useQuery";
import type { QueryResult } from "./useQuery";
import { getReports, getReport } from "../lib/api/reports";
import type { Report, ReportFilters } from "../lib/types/report";

export function useReports(filters?: ReportFilters): QueryResult<Report[]> {
  return useQuery(() => getReports(filters), [
    filters?.category,
    filters?.barrio,
    filters?.startDate,
    filters?.endDate,
  ]);
}

export function useReport(id: string): QueryResult<Report> {
  return useQuery(() => getReport(id), [id]);
}
