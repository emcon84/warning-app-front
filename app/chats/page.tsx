import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatsClient from "./ChatsClient";

export const metadata = { title: "Mis conversaciones | Reportes Reconquista" };

export default async function ChatsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <ChatsClient />;
}
