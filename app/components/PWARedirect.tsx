"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function PWARedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      router.replace("/oficios");
    }
  }, [pathname, router]);

  return null;
}
