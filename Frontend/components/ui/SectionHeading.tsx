import { AccentBar } from "@/components/ui/AccentBar";

type SectionHeadingProps = {
  title: string;
}

/**
 * De tussentitel "geel streepje — titel — geel streepje" die overal op de site
 * een nieuw blok aankondigt (home, teamdetail, contact, evenementen).
 *
 * Een lange titel (bv. bij een nieuwsbericht) breekt af over meerdere regels in
 * plaats van buiten het scherm te lopen; de streepjes houden een minimumbreedte.
 */
export function SectionHeading({ title }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-3 mb-4 lg:mb-6">
      <AccentBar className="h-1 w-8 shrink-0 lg:w-12" />
      <h2 className="min-w-0 text-white text-balance break-words title-section">{title}</h2>
      <AccentBar className="h-1 min-w-8 flex-1" />
    </div>
  );
}
