import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MiPerfilClient from "./MiPerfilClient";

export const metadata = { title: "Mi perfil | Reportes Reconquista" };

export default async function MiPerfilPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/mi-perfil");
  return <MiPerfilClient />;
}
