import { ClubTopicContent } from "@/components/pages/public/onze-club/ClubTopicContent";

/** De labels die de club behaalde. Een nieuw seizoen? Pas het jaartal en deze lijst aan. */
const labelYear = 2025;
const qualityLabels = ["Jeugdvriendelijke Volleybalclub", "Volley4all label", "Integriteitslabel", "Talentenlabel"];

export default function KwaliteitslabelsPage() {
  return (
    <ClubTopicContent slug="kwaliteitslabels">
      {/* Op desktop staan het witte kader en de afbeelding naast elkaar, even hoog;
          op een telefoon onder elkaar, even breed. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col justify-center bg-white/90 backdrop-blur-md rounded-2xl p-6 lg:p-10 shadow-xl border-2 border-white/50">
          <p className="text-(--color-primary-brand) leading-relaxed body-large font-medium mb-4 lg:mb-6">
            Onze club behaalde in {labelYear} de volgende kwaliteitslabels
          </p>

          {/* Zelfde rijen als de teamleden op een teampagina (TeamRoster). */}
          <div className="space-y-1.5">
            {qualityLabels.map((label) => (
              <div
                key={label}
                className="rounded-xl bg-(--color-primary-brand)/5 px-4 py-3 text-(--color-primary-brand) label-regular font-semibold transition-colors hover:bg-(--color-primary-brand)/10"
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* De officiële afbeelding van Volley Vlaanderen met de behaalde labels. */}
        <img
          src="/Kwaliteitslabels.jpeg"
          alt={`De kwaliteitslabels van FIT V.B.C. Ham in ${labelYear}, uitgereikt door Volley Vlaanderen`}
          className="w-full rounded-2xl shadow-xl"
        />
      </div>
    </ClubTopicContent>
  );
}
