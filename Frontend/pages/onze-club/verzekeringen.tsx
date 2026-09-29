import { Download, FileText } from "lucide-react";
import { ClubTopicContent } from "@/components/pages/public/onze-club/ClubTopicContent";

const paragraphClasses = "text-(--color-primary-brand) leading-relaxed body-large font-medium";

export default function VerzekeringenPage() {
  return (
    <ClubTopicContent slug="verzekeringen">
      {/* Witte kaart in dezelfde stijl als de andere inhoudsblokken. */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 lg:p-10 shadow-xl border-2 border-white/50">
        <h2
          className="text-(--color-primary-brand) mb-2 lg:mb-3 title-section"
          style={{ fontWeight: "var(--font-weight-extrabold)" }}
        >
          Verzekerd via Volley Vlaanderen
        </h2>
        <p className={`${paragraphClasses} mb-4 lg:mb-6`}>
          Als lid van Fit Ham ben je verzekerd bij Ethias. Die verzekering loopt via je inschrijving
          bij Volley Vlaanderen, dus je hoeft zelf niets extra te regelen.
        </p>
        <p className={paragraphClasses}>
          Een ongeval gehad? Je hebt 8 dagen na het ongeval de tijd om het aan te geven bij de club.
          Tot 8 dagen na het ongeval dekt de club de kosten.
        </p>
      </div>

      <a
        href="/Verzekering.pdf"
        download
        className="group mt-6 flex w-full items-center gap-4 rounded-2xl bg-white/90 backdrop-blur-md p-4 lg:p-5 shadow-xl border-2 border-white/50 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
      >
        {/* Documenticoon in een blauw tegeltje dat bij hover vol kleurt. */}
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-brand)/10 text-(--color-primary-brand) transition-colors group-hover:bg-(--color-primary-brand) group-hover:text-white">
          <FileText className="h-6 w-6" strokeWidth={2.25} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-(--color-primary-brand) label-regular font-extrabold">Document downloaden</span>
          <span className="block text-(--color-primary-brand)/60 label-small font-semibold">Verzekeringspapieren (PDF)</span>
        </span>
        <Download
          className="h-5 w-5 shrink-0 text-(--color-secondary-brand) transition-transform group-hover:translate-y-0.5"
          strokeWidth={2.5}
        />
      </a>
    </ClubTopicContent>
  );
}
