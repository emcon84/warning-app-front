import { Report, ReportCategory } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface CreateReportData {
  lat: number;
  lng: number;
  category: ReportCategory;
  description: string;
  barrio: string;
  direccion: string;
  photo?: File | string;
  photos?: File[]; // Múltiples fotos
  fecha?: string;
  isUrgent?: boolean;
}

export interface ReportFilters {
  category?: ReportCategory;
  barrio?: string;
  startDate?: string;
  endDate?: string;
}

// Obtener todos los reportes con filtros opcionales
export async function getReports(filters?: ReportFilters): Promise<Report[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.barrio) params.append("barrio", filters.barrio);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const url = `${API_BASE_URL}/api/reports${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error al obtener reportes: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
}

// Obtener un reporte específico
export async function getReport(id: string): Promise<Report> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${id}`);

    if (!response.ok) {
      throw new Error(`Error al obtener reporte: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching report:", error);
    throw error;
  }
}

// Crear un nuevo reporte
export async function createReport(data: CreateReportData): Promise<Report> {
  try {
    let body: FormData | string;
    let headers: HeadersInit = {};

    // Si hay fotos (múltiples o una sola), usar FormData
    if (data.photos && data.photos.length > 0) {
      const formData = new FormData();
      formData.append("lat", data.lat.toString());
      formData.append("lng", data.lng.toString());
      formData.append("category", data.category);
      formData.append("description", data.description);
      formData.append("barrio", data.barrio);
      formData.append("direccion", data.direccion);
      if (data.fecha) formData.append("fecha", data.fecha);
      if (data.isUrgent !== undefined)
        formData.append("isUrgent", data.isUrgent.toString());

      // Agregar todas las fotos
      data.photos.forEach((photo, index) => {
        formData.append(`photo${index}`, photo);
      });

      body = formData;
    } else if (data.photo instanceof File) {
      // Compatibilidad: una sola foto
      const formData = new FormData();
      formData.append("lat", data.lat.toString());
      formData.append("lng", data.lng.toString());
      formData.append("category", data.category);
      formData.append("description", data.description);
      formData.append("barrio", data.barrio);
      formData.append("direccion", data.direccion);
      if (data.fecha) formData.append("fecha", data.fecha);
      if (data.isUrgent !== undefined)
        formData.append("isUrgent", data.isUrgent.toString());
      formData.append("photo", data.photo);
      body = formData;
    } else {
      // Si no hay archivo o es string (retrocompatibilidad), usar JSON
      headers = { "Content-Type": "application/json" };
      body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || `Error al crear reporte: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
}

// Eliminar un reporte
export async function deleteReport(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || `Error al eliminar reporte: ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
}

// Actualizar un reporte
export async function updateReport(
  id: string,
  data: Partial<CreateReportData>,
): Promise<Report> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar reporte: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating report:", error);
    throw error;
  }
}

// Obtener estadísticas
export async function getStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats`);

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
}
