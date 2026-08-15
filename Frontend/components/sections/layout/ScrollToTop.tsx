"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Springt bij elke paginawissel terug naar boven. Zonder dit blijf je na het
 * klikken op een link hangen op de hoogte waar je stond. Hangt in pages/_app.
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
