import { ClubTopicContent } from "@/components/pages/public/onze-club/ClubTopicContent";
import { IntegrityForm } from "@/components/sections/onze-club/IntegrityForm";

const paragraphClasses = "text-(--color-primary-brand) leading-relaxed body-large font-medium";

export default function ApiPage() {
  return (
    <ClubTopicContent slug="api">
      {/* Witte kaart in dezelfde stijl als de andere inhoudsblokken. */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 lg:p-10 shadow-xl border-2 border-white/50">
        <h2
          className="text-(--color-primary-brand) mb-2 lg:mb-3 title-section"
          style={{ fontWeight: "var(--font-weight-extrabold)" }}
        >
          Aanspreekpunt integriteit
        </h2>
        <p className={`${paragraphClasses} mb-4 lg:mb-6`}>
          API staat voor <strong className="font-extrabold">Aanspreekpunt Integriteit</strong>. Dit is
          de vertrouwenspersoon binnen onze club bij wie je terecht kan met vragen, twijfels of
          meldingen over grensoverschrijdend gedrag. Zij luistert in alle vertrouwen, denkt met je
          mee en helpt je verder.
        </p>
        <p className={`${paragraphClasses} mb-4 lg:mb-6`}>
          Bij Fit Ham is er <strong className="font-extrabold">geen plaats</strong> voor discriminatie,
          pesten, agressie of seksueel grensoverschrijdend gedrag. Iedereen moet zich hier veilig,
          gerespecteerd en welkom voelen: op het veld, in de kleedkamer en daarbuiten.
        </p>
        <p className={paragraphClasses}>
          Heb je ook maar een klein gevoel dat er iets niet juist zit bij jezelf, bij iemand uit je
          team of iemand anders in de club? Twijfel niet en{" "}
          <a
            href="#api-formulier"
            className="text-(--color-secondary-brand) hover:text-(--color-accent) underline decoration-2 underline-offset-2 transition-colors font-bold"
          >
            laat het onze API weten
          </a>
          , gerust ook anoniem.
        </p>
      </div>

      <IntegrityForm />
    </ClubTopicContent>
  );
}
