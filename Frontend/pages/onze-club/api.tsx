import { Mail, Phone } from "lucide-react";
import { ClubTopicContent } from "@/components/pages/public/onze-club/ClubTopicContent";
import { ClubIntegrityOfficer } from "@/components/sections/onze-club/ClubIntegrityOfficer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IntegrityForm } from "@/components/sections/onze-club/IntegrityForm";

const paragraphClasses = "text-(--color-primary-brand) leading-relaxed body-large font-medium";
const linkClasses =
  "text-(--color-secondary-brand) hover:text-(--color-accent) underline decoration-2 underline-offset-2 transition-colors font-bold";
const contactLinkClasses =
  "flex w-fit items-center gap-2 text-(--color-primary-brand) font-bold transition-colors hover:text-(--color-secondary-brand)";

export default function ApiPage() {
  return (
    <ClubTopicContent slug="api">
      {/* Eerste deel: het aanspreekpunt binnen onze eigen club. */}
      <SectionHeading title="Fit Ham" />

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
      <ClubIntegrityOfficer />

      {/* Tweede deel: het onafhankelijke aanspreekpunt van de federatie. */}
      <div className="mt-10 lg:mt-14">
        <SectionHeading title="Volley Vlaanderen" />
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 lg:p-10 shadow-xl border-2 border-white/50">
        <h2
          className="text-(--color-primary-brand) mb-2 lg:mb-3 title-section"
          style={{ fontWeight: "var(--font-weight-extrabold)" }}
        >
          Aanspreekpunt integriteit Volley Vlaanderen (onafhankelijk)
        </h2>
        <p className={`${paragraphClasses} mb-4 lg:mb-6`}>
          Wil je je verhaal liever kwijt bij iemand buiten de club? Dan kan je terecht bij de{" "}
          <a
            href="https://volleyvlaanderen.be/Integriteit/Federatie/API"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClasses}
          >
            Federatie-API
          </a>{" "}
          van Volley Vlaanderen. Dit onafhankelijke aanspreekpunt luistert in alle vertrouwen naar
          je vraag, vermoeden of melding over grensoverschrijdend gedrag en helpt je verder.
        </p>
        <p className={paragraphClasses}>
          Meer info:{" "}
          <a
            href="https://volleyvlaanderen.be/integriteit"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClasses}
          >
            Integriteit – Volley Vlaanderen
          </a>
        </p>
      </div>

      {/* Contactkaartje van de Federatie-API: hetzelfde kaartje als een bestuurslid
          op de contactpagina (BoardMembers), met telefoon erbij. De foto staat in
          public/AnnaMariaWilmot.jpg. */}
      <div className="mt-4 bg-white/90 rounded-2xl p-5 shadow-xl border-2 border-white/50 hover:scale-[1.02] transition-transform">
        {/* Op een telefoon is het e-mailadres te lang om naast de foto te passen.
            Daar staan telefoon en e-mail daarom onder de foto, over de volle breedte,
            zodat het adres op één regel blijft. Vanaf tablet staat alles naast de foto. */}
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-4">
          {/* De foto is twee keer vergroot en verschoven, zodat het rondje op haar
              hoofd inzoomt. Een andere foto? Pas dan left/top hieronder aan. */}
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-(--color-primary-brand)/10 sm:row-span-2">
            <img
              src="/AnnaMariaWilmot.jpg"
              alt="Anna Maria Wilmot"
              className="absolute w-[200%] max-w-none left-[-40%] top-[-20%]"
            />
          </div>
          <div className="sm:self-end">
            <p className="text-(--color-primary-brand) label-large font-extrabold">Anna Maria Wilmot</p>
            <p className="label-regular text-(--color-primary-brand)/70 sm:mb-1 font-semibold">
              Federatie-API Volley Vlaanderen
            </p>
          </div>
          <div className="col-span-2 mt-3 sm:col-span-1 sm:col-start-2 sm:mt-0 sm:self-start">
            <a href="tel:+32485395016" className={contactLinkClasses}>
              <Phone className="w-4 h-4 shrink-0" />
              0485 39 50 16
            </a>
            <a href="mailto:annamariawilmot@hotmail.com" className={`${contactLinkClasses} whitespace-nowrap`}>
              <Mail className="w-4 h-4 shrink-0" />
              annamariawilmot@hotmail.com
            </a>
          </div>
        </div>
      </div>
    </ClubTopicContent>
  );
}
