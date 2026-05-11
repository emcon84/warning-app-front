import { apiFetch, jsonHeader } from "./client";
import type { Supermarket, Offer } from "../types/supermarket";

export async function getSupermarkets(): Promise<Supermarket[]> {
  return apiFetch<Supermarket[]>("/api/supermarkets");
}

export async function createSupermarket(data: { name: string; address: string }): Promise<Supermarket> {
  return apiFetch<Supermarket>("/api/supermarkets", {
    method: "POST",
    headers: jsonHeader(),
    body: JSON.stringify(data),
  });
}

export async function getOffers(supermarketId: string): Promise<Offer[]> {
  return apiFetch<Offer[]>(`/api/supermarkets/${supermarketId}/offers`);
}

export async function createOffer(data: {
  supermarketId: string;
  description: string;
  price?: string;
  validUntil?: string;
  photo?: File;
}): Promise<Offer> {
  if (data.photo instanceof File) {
    const fd = new FormData();
    fd.append("supermarketId", data.supermarketId);
    fd.append("description", data.description);
    if (data.price) fd.append("price", data.price);
    if (data.validUntil) fd.append("validUntil", data.validUntil);
    fd.append("photo", data.photo);
    return apiFetch<Offer>("/api/offers", { method: "POST", body: fd });
  }
  return apiFetch<Offer>("/api/offers", {
    method: "POST",
    headers: jsonHeader(),
    body: JSON.stringify(data),
  });
}

export async function updateOffer(id: string, data: {
  description?: string;
  price?: string;
  validUntil?: string;
  photo?: File;
}): Promise<Offer> {
  if (data.photo instanceof File) {
    const fd = new FormData();
    if (data.description) fd.append("description", data.description);
    if (data.price !== undefined) fd.append("price", data.price);
    if (data.validUntil !== undefined) fd.append("validUntil", data.validUntil);
    fd.append("photo", data.photo);
    return apiFetch<Offer>(`/api/offers/${id}`, { method: "PUT", body: fd });
  }
  return apiFetch<Offer>(`/api/offers/${id}`, {
    method: "PUT",
    headers: jsonHeader(),
    body: JSON.stringify(data),
  });
}

export async function deleteOffer(id: string): Promise<void> {
  await apiFetch<void>(`/api/offers/${id}`, { method: "DELETE" });
}

export async function deleteSupermarket(id: string): Promise<void> {
  await apiFetch<void>(`/api/supermarkets/${id}`, { method: "DELETE" });
}

export const deleteSupermarketOffer = deleteOffer;
