import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import GestionarComercioClient from "./GestionarComercioClient";

import { API_URL } from "../../lib/api/client";

export const metadata = { title: "Mi comercio" };

export default async function GestionarComercioPage() {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) redirect("/sign-in");

  const res = await fetch(`${API_URL}/api/comercios/me`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) redirect("/comercio/nuevo");
  if (!res.ok) redirect("/");

  const comercio = await res.json();

  return <GestionarComercioClient comercio={comercio} />;
}
