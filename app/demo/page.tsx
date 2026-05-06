import { redirect } from "next/navigation";
import MSWProvider from "./MSWProvider";
import DemoApp from "./DemoApp";

export const metadata = { title: "Demo interactiva | Reportes Reconquista", robots: "noindex" };

export default function DemoPage() {
  if (process.env.NEXT_PUBLIC_DEMO !== "true") redirect("/para-comercios");

  return (
    <MSWProvider>
      <DemoApp />
    </MSWProvider>
  );
}
