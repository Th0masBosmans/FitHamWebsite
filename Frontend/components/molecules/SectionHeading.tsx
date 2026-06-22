import { AccentBar } from "@/components/atoms/AccentBar";

type SectionHeadingProps = {
  title: string;
}

/**
 * The recurring "yellow bar — heading — yellow bar" divider used to introduce
 * sections across the site (home, team detail, contact, events).
 */
export function SectionHeading({ title }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-3 mb-4 lg:mb-6">
      <AccentBar className="h-1 w-8 lg:w-12" />
      <h2 className="text-white whitespace-nowrap title-section">{title}</h2>
      <AccentBar className="h-1 flex-1" />
    </div>
  );
}
