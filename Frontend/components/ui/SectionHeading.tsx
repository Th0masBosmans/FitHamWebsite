import { AccentBar } from "@/components/ui/AccentBar";

type SectionHeadingProps = {
  title: string;
}

/**
 * De tussentitel "geel streepje — titel — geel streepje" die overal op de site
 * een nieuw blok aankondigt (home, teamdetail, contact, evenementen).
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
