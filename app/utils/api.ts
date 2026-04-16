import { Report, ReportCategory, Doctor, Supermarket, Offer, Empleado, Vacante } from "../types";

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
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.barrio) params.append("barrio", filters.barrio);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  const url = `${API_BASE_URL}/api/reports${params.toString() ? `?${params}` : ""}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
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
    let body;
    let headers: HeadersInit = {};

    // Si hay fotos nuevas, usar FormData
    if (data.photos && data.photos.length > 0) {
      const formData = new FormData();
      if (data.category) formData.append("category", data.category);
      if (data.description) formData.append("description", data.description);
      if (data.barrio) formData.append("barrio", data.barrio);
      if (data.direccion) formData.append("direccion", data.direccion);
      if (data.isUrgent !== undefined)
        formData.append("isUrgent", data.isUrgent.toString());

      // Agregar cada foto con índice
      data.photos.forEach((photo, index) => {
        formData.append(`photo${index}`, photo);
      });

      body = formData;
    } else {
      // Sin fotos, usar JSON
      headers = { "Content-Type": "application/json" };
      body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
      method: "PUT",
      headers,
      body,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || `Error al actualizar reporte: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating report:", error);
    throw error;
  }
}

// ─── DOCTORS ─────────────────────────────────────────────────────────────────

export interface DoctorFilters {
  especialidad?: string
  obraSocial?: string
  ciudad?: string
}

export interface CreateDoctorData {
  nombre: string
  especialidad: string
  direccion: string
  barrio?: string
  ciudad?: string
  telefono?: string
  whatsapp?: string
  lat: number
  lng: number
  obrasSociales?: string[]
}

export async function getDoctors(filters?: DoctorFilters): Promise<Doctor[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.especialidad) params.append("especialidad", filters.especialidad)
    if (filters?.obraSocial) params.append("obraSocial", filters.obraSocial)
    if (filters?.ciudad) params.append("ciudad", filters.ciudad)

    const url = `${API_BASE_URL}/api/doctors${params.toString() ? `?${params}` : ""}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error al obtener médicos: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching doctors:", error)
    throw error
  }
}

export async function getDoctor(id: string): Promise<Doctor> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/doctors/${id}`)

    if (!response.ok) {
      throw new Error(`Error al obtener médico: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching doctor:", error)
    throw error
  }
}

export async function createDoctor(data: CreateDoctorData): Promise<Doctor> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/doctors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Error al crear médico: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating doctor:", error)
    throw error
  }
}

export async function updateDoctor(id: string, data: Partial<CreateDoctorData>): Promise<Doctor> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/doctors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Error al actualizar médico: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating doctor:", error)
    throw error
  }
}

export async function deleteDoctor(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/doctors/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Error al eliminar médico: ${response.statusText}`)
    }
  } catch (error) {
    console.error("Error deleting doctor:", error)
    throw error
  }
}

export async function confirmarDoctor(id: string, obraSocial: string, acepta: boolean): Promise<Doctor> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/doctors/${id}/confirmaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ obraSocial, acepta }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Error al confirmar: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error confirming doctor:", error)
    throw error
  }
}

export async function getDisponibilidad(doctorId: string) {
  const res = await fetch(`${API_BASE_URL}/api/doctors/${doctorId}/disponibilidad`);
  if (!res.ok) throw new Error("Error al obtener disponibilidad");
  return res.json();
}

export async function reportarDisponibilidad(doctorId: string, data: {
  dias: string[];
  horario: string;
  tipoTurno: string;
  obraSocial: string;
  nota?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/doctors/${doctorId}/disponibilidad`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al reportar disponibilidad");
  return res.json();
}

// ─── FIN DOCTORS ─────────────────────────────────────────────────────────────

// ─── FARMACIAS ───────────────────────────────────────────────────────────────

export async function getFarmacias() {
  const res = await fetch(`${API_BASE_URL}/api/farmacias`);
  if (!res.ok) throw new Error("Error al obtener farmacias");
  return res.json();
}

export async function getFarmaciasTurno() {
  const res = await fetch(`${API_BASE_URL}/api/farmacias/turno`);
  if (!res.ok) throw new Error("Error al obtener turno");
  return res.json();
}

export async function updateFarmacia(id: string, data: { lat?: number; lng?: number; direccion?: string; nombre?: string; telefono?: string }) {
  const res = await fetch(`${API_BASE_URL}/api/farmacias/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar farmacia");
  return res.json();
}

// ─── SUPERMARKETS & OFERTAS ──────────────────────────────────────────────────

export async function getSupermarkets(): Promise<Supermarket[]> {
  const res = await fetch(`${API_BASE_URL}/api/supermarkets`);
  if (!res.ok) throw new Error("Error al obtener supermercados");
  return res.json();
}

export async function createSupermarket(data: { name: string; address: string }): Promise<Supermarket> {
  const res = await fetch(`${API_BASE_URL}/api/supermarkets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear supermercado");
  return res.json();
}

export async function getOffers(supermarketId: string): Promise<Offer[]> {
  const res = await fetch(`${API_BASE_URL}/api/supermarkets/${supermarketId}/offers`);
  if (!res.ok) throw new Error("Error al obtener ofertas");
  return res.json();
}

export async function createOffer(data: {
  supermarketId: string;
  description: string;
  price?: string;
  validUntil?: string;
  photo?: File;
}): Promise<Offer> {
  let body: FormData | string;
  let headers: HeadersInit = {};

  if (data.photo instanceof File) {
    const formData = new FormData();
    formData.append("supermarketId", data.supermarketId);
    formData.append("description", data.description);
    if (data.price) formData.append("price", data.price);
    if (data.validUntil) formData.append("validUntil", data.validUntil);
    formData.append("photo", data.photo);
    body = formData;
  } else {
    headers = { "Content-Type": "application/json" };
    body = JSON.stringify(data);
  }

  const res = await fetch(`${API_BASE_URL}/api/offers`, {
    method: "POST",
    headers,
    body,
  });
  if (!res.ok) throw new Error("Error al crear oferta");
  return res.json();
}

export async function deleteSupermarketOffer(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/offers/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar oferta");
}

export async function updateOffer(id: string, data: {
  description?: string;
  price?: string;
  validUntil?: string;
  photo?: File;
}): Promise<Offer> {
  let body: FormData | string;
  let headers: HeadersInit = {};

  if (data.photo instanceof File) {
    const formData = new FormData();
    if (data.description) formData.append("description", data.description);
    if (data.price !== undefined) formData.append("price", data.price);
    if (data.validUntil !== undefined) formData.append("validUntil", data.validUntil);
    formData.append("photo", data.photo);
    body = formData;
  } else {
    headers = { "Content-Type": "application/json" };
    body = JSON.stringify(data);
  }

  const res = await fetch(`${API_BASE_URL}/api/offers/${id}`, { method: "PUT", headers, body });
  if (!res.ok) throw new Error("Error al actualizar oferta");
  return res.json();
}

export async function deleteSupermarket(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/supermarkets/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar supermercado");
}

// ─── FIN SUPERMARKETS & OFERTAS ──────────────────────────────────────────────

// ─── EMPLEADOS ───────────────────────────────────────────────────────────────

export async function getEmpleados(filters?: { barrio?: string; habilidad?: string }): Promise<Empleado[]> {
  const params = new URLSearchParams();
  if (filters?.barrio) params.append("barrio", filters.barrio);
  if (filters?.habilidad) params.append("habilidad", filters.habilidad);
  const url = `${API_BASE_URL}/api/empleados${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener empleados");
  return res.json();
}

export async function getEmpleado(slug: string): Promise<Empleado> {
  const res = await fetch(`${API_BASE_URL}/api/empleados/${slug}`);
  if (!res.ok) throw new Error("Empleado no encontrado");
  return res.json();
}

export async function getEmpleadoMe(token: string): Promise<Empleado> {
  const res = await fetch(`${API_BASE_URL}/api/empleados/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No tenés un perfil de empleado");
  return res.json();
}

export async function createEmpleado(data: FormData, token: string): Promise<Empleado> {
  const res = await fetch(`${API_BASE_URL}/api/empleados`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear perfil");
  }
  return res.json();
}

export async function updateEmpleado(data: FormData, token: string): Promise<Empleado> {
  const res = await fetch(`${API_BASE_URL}/api/empleados/me`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al actualizar perfil");
  }
  return res.json();
}

export async function iniciarConversacionEmpleado(slug: string, data: {
  clientToken: string;
  clientName?: string;
  mensaje: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/empleados/${slug}/conversaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al iniciar conversación");
  }
  return res.json();
}

// ─── FIN EMPLEADOS ────────────────────────────────────────────────────────────

// ─── VACANTES ────────────────────────────────────────────────────────────────

export async function getVacantes(filters?: { barrio?: string; habilidad?: string }): Promise<Vacante[]> {
  const params = new URLSearchParams();
  if (filters?.barrio) params.append("barrio", filters.barrio);
  if (filters?.habilidad) params.append("habilidad", filters.habilidad);
  const url = `${API_BASE_URL}/api/vacantes${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener vacantes");
  return res.json();
}

export async function getVacante(id: string): Promise<Vacante> {
  const res = await fetch(`${API_BASE_URL}/api/vacantes/${id}`);
  if (!res.ok) throw new Error("Vacante no encontrada");
  return res.json();
}

export async function getMisVacantes(token: string): Promise<Vacante[]> {
  const res = await fetch(`${API_BASE_URL}/api/vacantes/mis`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener vacantes");
  return res.json();
}

export async function createVacante(data: {
  titulo: string;
  descripcion: string;
  habilidades: string[];
  barrio?: string;
  horario?: string;
  salario?: string;
  modalidad?: string;
}, token: string): Promise<Vacante> {
  const res = await fetch(`${API_BASE_URL}/api/vacantes`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear vacante");
  }
  return res.json();
}

export async function updateVacante(id: string, data: Partial<{
  titulo: string;
  descripcion: string;
  habilidades: string[];
  barrio: string;
  horario: string;
  salario: string;
  modalidad: string;
  activa: boolean;
}>, token: string): Promise<Vacante> {
  const res = await fetch(`${API_BASE_URL}/api/vacantes/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al actualizar vacante");
  }
  return res.json();
}

export async function deleteVacante(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/vacantes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al eliminar vacante");
}

export async function postularseVacante(id: string, data: {
  clientToken: string;
  clientName?: string;
  mensaje: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/vacantes/${id}/conversaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al postularse");
  }
  return res.json();
}

// ─── FIN VACANTES ─────────────────────────────────────────────────────────────

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
