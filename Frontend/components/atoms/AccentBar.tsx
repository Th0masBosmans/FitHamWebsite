import { cn } from "@/lib/cn";

/**
 * The yellow brand bar used as a heading accent: a vertical plate beside page
 * titles and the horizontal rules in section dividers. Size it via className.
 */
export function AccentBar({ className }: { className?: string }) {
  return <div className={cn("rounded-full bg-[var(--color-accent)]", className)} />;
}
