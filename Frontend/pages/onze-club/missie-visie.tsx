import { ClubTopicContent } from "@/components/pages/public/onze-club/ClubTopicContent";

const cardClasses = "bg-white/90 backdrop-blur-md rounded-2xl p-6 lg:p-10 shadow-xl border-2 border-white/50";
const paragraphClasses = "text-(--color-primary-brand) leading-relaxed body-large font-medium";

/** De zes ambities onder "Onze visie"; de volgorde hier is de nummering op de pagina. */
const ambitions = [
  "Een sterke jeugdwerking waarin kinderen en jongeren met plezier kunnen starten en doorgroeien.",
  "Een evenwichtige sportieve werking met ruimte voor verschillende niveaus en ambities.",
  "Een hechte clubcultuur waarin ploegen en generaties met elkaar verbonden zijn.",
  "Een open vereniging waar mensen met verschillende achtergronden zich welkom voelen.",
  "Een betrokken vrijwilligerswerking waarin iedereen naar eigen mogelijkheden kan bijdragen.",
  "Een herkenbare regionale aanwezigheid in Ham en de omliggende gemeenten.",
];

// In twee helften, zodat je elke kolom van boven naar onder leest (1-3 links, 4-6 rechts).
const ambitionColumns = [ambitions.slice(0, 3), ambitions.slice(3)];

function CardTitle({ children }: { children: string }) {
  return (
    <h2
      className="text-(--color-primary-brand) mb-2 lg:mb-3 title-section"
      style={{ fontWeight: "var(--font-weight-extrabold)" }}
    >
      {children}
    </h2>
  );
}

export default function MissieVisiePage() {
  return (
    <ClubTopicContent slug="missie-visie">
      <div className={cardClasses}>
        <CardTitle>Fit Ham - Meer dan volleybal</CardTitle>
        <p className={`${paragraphClasses} mb-4 lg:mb-6`}>
          Fit Ham is een familiale en toegankelijke volleybalclub, stevig verankerd in Ham en de
          omliggende regio. We brengen mensen van verschillende leeftijden, achtergronden en niveaus
          samen rond volleybal. Van kinderen die hun eerste sportieve stappen zetten tot ervaren
          spelers en recreanten die genieten van het spel en het samenzijn.
        </p>
        <p className={paragraphClasses}>
          Bij Fit Ham draait het om meer dan winnen of verliezen. We willen een omgeving bieden waar
          iedereen welkom is, zichzelf kan zijn en deel uitmaakt van een hechte groep. We helpen onze
          leden niet alleen beter volleyballen, maar ook groeien in samenwerking,
          verantwoordelijkheid en respect.
        </p>
      </div>

      <div className={`${cardClasses} mt-6 lg:mt-8`}>
        <CardTitle>Onze missie</CardTitle>
        <p className={`${paragraphClasses} mb-4 lg:mb-6`}>
          We bieden meisjes en jongens, dames en heren de kans om op hun eigen niveau te
          volleyballen, zich te ontwikkelen en deel uit te maken van een warme club.
        </p>
        <p className={paragraphClasses}>
          Sportplezier, persoonlijke groei, respect en verbondenheid staan centraal. Spelers,
          trainers, ouders, supporters en vrijwilligers bouwen samen aan de club.
        </p>
      </div>

      <div className={`${cardClasses} mt-6 lg:mt-8`}>
        <CardTitle>Onze visie</CardTitle>
        <p className={`${paragraphClasses} mb-4 lg:mb-6`}>
          Fit Ham wil een warme, toegankelijke en herkenbare volleybalclub zijn waar mensen van alle
          leeftijden en niveaus zich thuis voelen. We bouwen aan een brede clubwerking waarin jeugd,
          competitie en recreatie elkaar versterken.
        </p>
        <p className={`${paragraphClasses} mb-4 lg:mb-6`}>
          Iedere speler krijgt kansen om zich sportief en persoonlijk te ontwikkelen, op het niveau
          dat bij hem of haar past. We zoeken een gezonde balans tussen ambitie, inzet en spelplezier,
          met aandacht voor het welbevinden van elke speler.
        </p>
        <p className={`${paragraphClasses} mb-4 lg:mb-6`}>
          Ook naast het volleybal willen we mensen samenbrengen. We versterken de band tussen
          ploegen, generaties en families en bouwen aan een club waar leden zich betrokken voelen.
        </p>

        <p className={`${paragraphClasses} mb-2 lg:mb-3`}>
          <strong className="font-extrabold">Onze ambities zijn:</strong>
        </p>
        {/* Zelfde rijen als de teamleden op een teampagina (TeamRoster): lichtblauwe
            balkjes in twee kolommen, met het nummer in een blauw bolletje. */}
        <div className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-x-3">
          {ambitionColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-1.5">
              {column.map((ambition) => (
                <div
                  key={ambition}
                  className="flex items-center gap-3 rounded-xl bg-(--color-primary-brand)/5 px-4 py-3 transition-colors hover:bg-(--color-primary-brand)/10"
                >
                  <span className="shrink-0 rounded-full bg-(--color-primary-brand) px-3.5 py-1 text-white label-small font-bold">
                    {ambitions.indexOf(ambition) + 1}
                  </span>
                  <span className="text-(--color-primary-brand) label-regular font-semibold">{ambition}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </ClubTopicContent>
  );
}
