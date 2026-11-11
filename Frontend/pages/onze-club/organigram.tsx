import { Download, FileText } from "lucide-react";
import { ClubTopicContent } from "@/components/pages/public/onze-club/ClubTopicContent";
import { BoardMembers } from "@/components/sections/contact/BoardMembers";

type OrganigramTask = { title: string; detail?: string };
type OrganigramMember = { name: string; role: string; tasks: OrganigramTask[] };

/**
 * Het organigram, overgenomen uit public/Organigram.pdf. Verandert de
 * taakverdeling, pas dan deze lijst aan én vervang het PDF.
 */
const organigram: OrganigramMember[] = [
  {
    name: "Dimitri Vermierdt",
    role: "Voorzitter",
    tasks: [
      { title: "Sponsors", detail: "Supervisie sponsorteam" },
      { title: "Trainers", detail: "Aanspreekpunt & vergaderingen" },
      { title: "Clubkledij", detail: "Supervisie werkgroep" },
      { title: "Sportief beleid", detail: "Samen met Jasper" },
      { title: "UitPAS" },
    ],
  },
  {
    name: "Jasper Van de Weyer",
    role: "Secretaris",
    tasks: [
      { title: "Contact gemeente", detail: "Problemen & reservaties" },
      { title: "Contact federatie", detail: "Incl. planning en wijzigingen" },
      { title: "Twizzit", detail: "Beheer & administratie" },
      { title: "Financiën & boekhouding" },
      { title: "VolleyAdmin", detail: "Ledenadministratie" },
      { title: "Sportief beleid", detail: "Samen met Dimitri" },
    ],
  },
  {
    name: "Jolien Claes",
    role: "Communicatie",
    tasks: [
      { title: "Nieuws & communicatie" },
      { title: "Volley Café", detail: "Aanspreekpunt / stockbeheer" },
      { title: "Ploegverantwoordelijken" },
      { title: "Evenementen", detail: "Evenemententeam" },
    ],
  },
  {
    name: "Pieter Lambrechts",
    role: "Bestuurslid",
    tasks: [
      { title: "Branding & design" },
      { title: "Verzekeringen", detail: "Ethias & DVV" },
      { title: "Subsidies", detail: "Gemeente & JSF" },
    ],
  },
  { name: "Steven Vangenechten", role: "Financieel ondersteuner", tasks: [] },
];

/** De kleur van alle verbindingslijntjes in het schema. */
const lineClasses = "bg-(--color-primary-brand)/30";

export default function OrganigramPage() {
  return (
    <ClubTopicContent slug="organigram">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border-2 border-white/50">
        <h2
          className="text-(--color-primary-brand) text-center title-section mb-5 lg:mb-0"
          style={{ fontWeight: "var(--font-weight-extrabold)" }}
        >
          Bestuur FIT V.B.C. Ham
        </h2>

        {/* Het lijntje van de titel naar de dwarslijn boven de vijf kolommen (alleen
            op desktop, waar de bestuursleden naast elkaar staan). */}
        <div className={`hidden lg:block mx-auto mt-3 h-5 w-0.5 ${lineClasses}`} />

        {/* Eén kolom per bestuurslid, zoals in het PDF: bovenaan het naamblok, met
            de taken eronder aan een verticale lijn. Op een telefoon staan de
            bestuursleden onder elkaar. */}
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-5 lg:gap-0">
          {organigram.map((member, memberIndex) => (
            <div key={member.name} className="lg:px-1.5">
              {/* Dwarslijn + lijntje naar het naamblok. De eerste en laatste kolom
                  krijgen maar een halve dwarslijn, zodat ze netjes eindigt. */}
              <div className="relative hidden h-5 lg:block">
                <span
                  className={`absolute top-0 h-0.5 ${lineClasses} ${
                    memberIndex === 0
                      ? "left-1/2 -right-1.5"
                      : memberIndex === organigram.length - 1
                        ? "-left-1.5 right-1/2"
                        : "-inset-x-1.5"
                  }`}
                />
                <span className={`absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 ${lineClasses}`} />
              </div>

              {/* Vaste hoogtes voor naamblokken en taken, zodat alle blokjes even
                  groot zijn, ook als een naam of taak over twee regels loopt. */}
              <div className="flex h-16 flex-col justify-center rounded-xl bg-(--color-primary-brand) px-2 text-center text-white lg:h-20">
                <p className="label-regular font-extrabold leading-tight">{member.name}</p>
                <p className="label-small font-semibold text-white/80">{member.role}</p>
              </div>

              <div className="ml-2">
                {member.tasks.map((task, taskIndex) => (
                  <div key={task.title} className="relative pl-2 pt-1.5">
                    {/* Verticale lijn langs de taken; bij de laatste taak stopt ze
                        halverwege, bij het dwarsstreepje. */}
                    <span
                      className={`absolute left-0 top-0 w-0.5 ${lineClasses} ${
                        taskIndex === member.tasks.length - 1 ? "h-[calc(50%+0.25rem)]" : "h-full"
                      }`}
                    />
                    <span className={`absolute left-0 top-[calc(50%+0.1875rem)] h-0.5 w-2 ${lineClasses}`} />
                    <div
                      className="flex h-14 flex-col justify-center rounded-lg bg-(--color-primary-brand)/5 px-2 text-center break-words hyphens-auto lg:h-20"
                      lang="nl"
                    >
                      <p className="text-(--color-primary-brand) label-small font-bold leading-tight">{task.title}</p>
                      {task.detail && (
                        <p className="text-(--color-primary-brand)/60 text-xs font-medium">{task.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <a
        href="/Organigram.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-6 flex w-full items-center gap-4 rounded-2xl bg-white/90 backdrop-blur-md p-4 lg:p-5 shadow-xl border-2 border-white/50 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-brand)/10 text-(--color-primary-brand) transition-colors group-hover:bg-(--color-primary-brand) group-hover:text-white">
          <FileText className="h-6 w-6" strokeWidth={2.25} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-(--color-primary-brand) label-regular font-extrabold">Organigram downloaden</span>
          <span className="block text-(--color-primary-brand)/60 label-small font-semibold">Het volledige schema (PDF)</span>
        </span>
        <Download
          className="h-5 w-5 shrink-0 text-(--color-secondary-brand) transition-transform group-hover:translate-y-0.5"
          strokeWidth={2.5}
        />
      </a>

      {/* Hetzelfde bestuursoverzicht als op de contactpagina (uit de tabel board_members). */}
      <div className="mt-8 lg:mt-10">
        <BoardMembers />
      </div>
    </ClubTopicContent>
  );
}
