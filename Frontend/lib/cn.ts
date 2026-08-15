import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Plakt Tailwind-klassen aan elkaar. Botsen er twee (bv. twee keer een
 * achtergrondkleur), dan wint de laatste. Handig om een component een
 * standaardstijl te geven die de gebruiker via className kan overschrijven.
 */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes));
}
