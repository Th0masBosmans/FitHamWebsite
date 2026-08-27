"use client";

import { PenLine, ShoppingCart } from "lucide-react";

/**
 * De twee knoppen die je in het beheerpaneel kan kiezen, elk met hun eigen
 * icoontje. Wat hier staat is meteen wat er op de knop komt en wat er in de
 * database bewaard wordt; het beheerpaneel leest deze lijst ook uit voor zijn
 * keuzerondjes, zodat de twee nooit uit elkaar kunnen lopen.
 */
export const REGISTRATION_OPTIONS = [
  { label: "Bestel hier", icon: ShoppingCart },
  { label: "Schrijf in", icon: PenLine },
] as const;

/** Zoekt de gekozen knop op. Staat er niets (of iets van vroeger) in de
 *  database, dan valt hij terug op de eerste. */
export function registrationOption(label?: string | null) {
  return REGISTRATION_OPTIONS.find((option) => option.label === label) ?? REGISTRATION_OPTIONS[0];
}

/**
 * De inschrijf- of bestelknop van een evenement: de link die het beheerpaneel
 * meegeeft, bv. naar Twizzit.
 *
 * Staat er zo'n link op, dan is dit de belangrijkste knop van de kaart: geel,
 * met een trage halo eromheen zodat ze meteen opvalt. "Zet in agenda" zakt dan
 * naar de gedempte glazen stijl, zodat er per kaart maar één knop roept.
 */
export function EventRegistrationButton({
  url,
  label,
  size = "regular",
  className = "",
}: {
  url: string;
  label?: string | null;
  /** Klein op de tijdlijnkaartjes, gewoon op de grote kaart en in het detailvenster. */
  size?: "small" | "regular";
  className?: string;
}) {
  const { label: text, icon: Icon } = registrationOption(label);
  // Op een gsm iets krapper, zodat deze knop en "zet in agenda" samen op één
  // regel blijven; vanaf tablet is er ruimte zat en mag ze weer ademen.
  const padding = size === "small" ? "gap-1.5 px-3 py-1.5 sm:gap-2 sm:px-4" : "gap-1.5 px-4 py-2.5 sm:gap-2 sm:px-5";
  const iconSize = size === "small" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      // De kaarten eronder openen bij een klik; die mag hier niet doorlopen.
      onClick={(clickEvent) => clickEvent.stopPropagation()}
      className={`cta-glow inline-flex items-center whitespace-nowrap rounded-full bg-[var(--color-accent)] text-[var(--color-primary-brand)] ${padding} label-small font-extrabold uppercase tracking-wide shadow-lg transition-all hover:bg-white hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white ${className}`}
    >
      <Icon className={`${iconSize} shrink-0`} />
      {text}
    </a>
  );
}
