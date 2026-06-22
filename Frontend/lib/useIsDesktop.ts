import { useEffect, useState } from "react";

/**
 * Tracks whether the viewport is at least `minWidth` (defaults to the desktop
 * breakpoint, 1024px). Starts false so server render and first paint match the
 * mobile layout, then corrects on mount and on resize.
 */
export function useIsDesktop(minWidth = 1024): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= minWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [minWidth]);

  return isDesktop;
}
