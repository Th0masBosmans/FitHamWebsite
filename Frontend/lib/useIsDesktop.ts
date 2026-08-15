import { useEffect, useState } from "react";

/**
 * Zegt of het scherm breed genoeg is voor de desktopweergave (vanaf 1024px).
 *
 * Nodig waar de layout in JavaScript moet weten hoe breed het scherm is en een
 * Tailwind-klasse als `lg:` dus niet volstaat — bv. de header die zijn blauwe
 * vlak breder maakt, en de sponsorcarrousel in de footer die op desktop 5 in
 * plaats van 3 logo's toont.
 *
 * Begint altijd op false, zodat de eerste weergave op de server en in de browser
 * gelijk zijn; daarna corrigeert hij zichzelf en luistert hij naar schermwissels.
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
