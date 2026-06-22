import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class lists, letting later classes override earlier conflicts. */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes));
}
