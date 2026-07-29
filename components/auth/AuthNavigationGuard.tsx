"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AuthNavigationGuard({ userRole }: { userRole: string }) {
  const router = useRouter();

  useEffect(() => {
    // Push history state entry so pressing browser Back arrow won't easily land on unauthenticated pages
    try {
      window.history.pushState(null, "", window.location.href);
    } catch {}

    const handlePopState = () => {
      const currentPath = window.location.pathname;
      // If back/forward navigation lands on landing, signin, or signup pages while authenticated
      if (currentPath === "/" || currentPath === "/signin" || currentPath === "/signup") {
        const targetPath = userRole === "staff" ? "/staff" : "/owner";
        try {
          window.history.pushState(null, "", targetPath);
        } catch {}
        router.replace(targetPath);
      } else {
        try {
          window.history.pushState(null, "", window.location.href);
        } catch {}
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router, userRole]);

  return null;
}
