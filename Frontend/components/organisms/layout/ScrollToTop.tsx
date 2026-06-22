"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Forces the window to scroll to the top on every route change.
 * Replaces the route-change effect that lived in the old React Router `Root`.
 */
export function ScrollToTop() {
  const { pathname } = useRouter();

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [pathname]);

  return null;
}
