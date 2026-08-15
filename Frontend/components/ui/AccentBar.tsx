import { cn } from "@/lib/cn";

/**
 * Het gele balkje van de clubhuisstijl. Staat rechtop naast een paginatitel
 * (zie PageHeading) en ligt plat als streepje in een tussentitel
 * (zie SectionHeading). De afmeting geef je mee via className.
 */
export function AccentBar({ className }: { className?: string }) {
  return <div className={cn("rounded-full bg-[var(--color-accent)]", className)} />;
}
