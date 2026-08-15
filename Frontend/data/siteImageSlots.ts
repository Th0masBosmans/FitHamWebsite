import type { SiteImageSlot } from "@/types";

/**
 * De vaste plekken op de site waar een beheerder zelf een foto kan instellen.
 *
 * In het beheerpaneel (tab "Home") kiest de beheerder een plek uit dit lijstje
 * en uploadt daar een foto bij; die belandt in Cloudinary en de verwijzing komt
 * in de tabel `site_images`. De pagina haalt hem daarna op met de `page`-sleutel
 * hieronder — zie pages/index.tsx voor "home-hero".
 *
 * Wil je elders op de site zo'n instelbare foto? Zet er hier een regel bij en
 * laat die pagina de foto opvragen met dezelfde sleutel.
 */
export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  { page: "home-hero", label: "Home - Herobanner" },
];

export function getSiteImageSlotLabel(page: string): string {
  return SITE_IMAGE_SLOTS.find((slot) => slot.page === page)?.label ?? page;
}
