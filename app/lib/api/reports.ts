import { apiFetch, jsonHeader } from "./client";
import type { Report, CreateReportData, ReportFilters } from "../types/report";

export async function getReports(filters?: ReportFilters): Promise<Report[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.barrio) params.append("barrio", filters.barrio);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  const qs = params.toString();
  return apiFetch<Report[]>(`/api/reports${qs ? `?${qs}` : ""}`);
}

export async function getReport(id: string): Promise<Report> {
  return apiFetch<Report>(`/api/reports/${id}`);
}

export async function createReport(data: CreateReportData): Promise<Report> {
  const fd = new FormData();
  fd.append("lat", data.lat.toString());
  fd.append("lng", data.lng.toString());
  fd.append("category", data.category);
  fd.append("description", data.description);
  fd.append("barrio", data.barrio);
  fd.append("direccion", data.direccion);
  if (data.fecha) fd.append("fecha", data.fecha);
  if (data.isUrgent !== undefined) fd.append("isUrgent", data.isUrgent.toString());
  if (data.photo instanceof File) {
    fd.append("photo", data.photo);
  }
  if (data.photos && data.photos.length > 0) {
    data.photos.forEach((photo, i) => fd.append(`photo${i}`, photo));
  }
  return apiFetch<Report>("/api/reports", { method: "POST", body: fd });
}

export async function updateReport(id: string, data: Partial<CreateReportData>): Promise<Report> {
  if (data.photos && data.photos.length > 0) {
    const fd = new FormData();
    if (data.category) fd.append("category", data.category);
    if (data.description) fd.append("description", data.description);
    if (data.barrio) fd.append("barrio", data.barrio);
    if (data.direccion) fd.append("direccion", data.direccion);
    if (data.isUrgent !== undefined) fd.append("isUrgent", data.isUrgent.toString());
    data.photos.forEach((photo, i) => fd.append(`photo${i}`, photo));
    return apiFetch<Report>(`/api/reports/${id}`, { method: "PUT", body: fd });
  }
  return apiFetch<Report>(`/api/reports/${id}`, {
    method: "PUT",
    headers: jsonHeader(),
    body: JSON.stringify(data),
  });
}

export async function deleteReport(id: string): Promise<void> {
  await apiFetch<void>(`/api/reports/${id}`, { method: "DELETE" });
}
