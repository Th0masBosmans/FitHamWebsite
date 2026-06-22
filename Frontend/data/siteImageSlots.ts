import type { SiteImageSlot } from "@/types";

/**
 * Predefined spots on the site that can hold a managed image. The admin picks a
 * slot here instead of typing a name/page by hand, so adding an image only means
 * choosing the location and uploading a file.
 */
export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  { page: "home-hero", label: "Home - Herobanner" },
];

export function getSiteImageSlotLabel(page: string): string {
  return SITE_IMAGE_SLOTS.find((slot) => slot.page === page)?.label ?? page;
}
