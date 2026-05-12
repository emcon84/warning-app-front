import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatClient from "./ChatClient";

export default async function ChatPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { conversationId } = await params;
  return <ChatClient conversationId={conversationId} />;
}
