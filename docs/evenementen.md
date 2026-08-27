# Evenementen — `/events`

De clubkalender: een uitgelicht evenement bovenaan en daaronder een tijdlijn met
alles wat komt en al geweest is.

## Welke bestanden

| Bestand | Wat het doet |
| --- | --- |
| `Frontend/pages/events.tsx` | Het adres |
| `Frontend/components/pages/public/EventsContent.tsx` | Zet de pagina samen, splitst komend/voorbij |
| `Frontend/components/sections/events/FeaturedEventCard.tsx` | De grote kaart bovenaan |
| `Frontend/components/sections/events/EventsTimeline.tsx` | De tijdlijn met de rollende bal |
| `Frontend/components/sections/events/EventCard.tsx` | Eén kaartje op de tijdlijn |
| `Frontend/components/sections/events/EventDetailModal.tsx` | Het venster als je een kaartje aanklikt |
| `Frontend/components/sections/events/timelineParts.tsx` | De losse stukjes van de tijdlijn |
| `Frontend/components/sections/events/EventRegistrationButton.tsx` | De actieknop (bestellen / inschrijven) |
| `Frontend/repository/eventRepository.ts` | Alle gesprekken over evenementen |
| `Frontend/lib/eventFormat.ts` | Alles rond datums en het agenda-bestand |

---

## Waar de gegevens vandaan komen

Alles uit de Supabase-tabel `events`; de affiches uit **Cloudinary**.

Per evenement: titel, omschrijving, plaats, begin- en einduur, affiche, of het
uitgelicht is, optioneel een gekoppeld fotoalbum, en optioneel de link van de
actieknop met het opschrift dat erop hoort.

Bij het ophalen wordt er meteen bijgeteld hoeveel foto's er in het gekoppelde
album zitten. Dat getal staat niet in de database — het dient alleen om te weten
of de knop "bekijk foto's" zin heeft.

---

## Hoe komend en voorbij bepaald worden

Een evenement is **voorbij** zodra het helemaal gedaan is: het **einduur** als
dat ingevuld is, anders het **beginuur**. Een evenement van een hele dag met
alleen een beginuur verdwijnt dus al 's ochtends uit "komend".

- Komende evenementen: op datum, eerstvolgende bovenaan
- Voorbije evenementen: omgekeerd, recentste eerst
- Ertussen komt het bordje "Afgelopen"

Het **uitgelichte** evenement krijgt de grote kaart bovenaan, maar blijft ook
gewoon op zijn datum in de tijdlijn staan, zodat de kalender volledig blijft.
Alleen komende evenementen kunnen uitgelicht worden.

Is er nog geen enkel evenement, dan toont de pagina een kort stukje tijdlijn met
streepjes en een pijltje, zodat ze niet leeg oogt.

---

## De tijdlijn

De blikvanger van deze pagina. Terwijl je scrolt rolt er een volleybal langs een
verticale lijn naar beneden:

- De lijn is donkerblauw; het stuk dat je al voorbij bent kleurt geel mee met de
  bal.
- De stip bij elk evenement springt van blauw naar geel als de bal passeert, en
  terug als je omhoog scrolt.
- De rand van het bijhorende kaartje doet dat kleurtje mee. Het moment verschilt
  wel per scherm: op mobiel als de bal onderaan de kaart is, op desktop als hij
  het midden passeert.
- Het pijltje onderaan licht als laatste op.
- Op desktop staan de kaartjes afwisselend links en rechts van de lijn, telkens
  een stukje lager dan de vorige (het trapjeseffect). Op mobiel staan ze onder
  elkaar over de volle breedte, en zie je de bal alleen in de tussenruimtes.

Door dat trapjeseffect schuift de omhulling van elk kaartje over de onderkant van
het vorige heen. Die omhulling is doorzichtig maar zou daar wel de muis opvangen,
precies waar het paneeltje met de knoppen openklapt. Ze staat daarom op
`pointer-events-none`, en alleen de kolom met de kaart zelf vangt de muis op.

De losse onderdelen (lijn, streepjes, pijl, stippen, bordje "Afgelopen") staan in
`timelineParts.tsx`; `EventsTimeline.tsx` zet ze samen en regelt de beweging.

Bezoekers die in hun systeeminstellingen minder beweging gevraagd hebben, krijgen
de animaties niet.

---

## "Zet in agenda"

De knop maakt ter plekke een agenda-bestand (`.ics`) aan en biedt dat aan als
download. Er komt geen bestand uit `public/` aan te pas.

Bewust een downloadbaar bestand en geen link naar Google Agenda: zo opent het in
de agenda-app die de bezoeker zelf gebruikt (Google, Apple, Outlook, ...). Heeft
het evenement geen einduur, dan rekenen we 2 uur.

Staat in `lib/eventFormat.ts`. De wedstrijdkaart op een teampagina doet hetzelfde,
maar heeft daar een eigen kopie van in `sections/teams/NextMatchCard.tsx`.

---

## De actieknop

In het beheerpaneel, tab **Evenementen**, staat een vinkje **Actieknop**.
Zet je dat aan, dan kies je met keuzerondjes één van twee vaste opschriften en
vul je de link in waar de bezoeker naartoe moet, bijvoorbeeld naar Twizzit:

| Opschrift | Icoontje | Waarvoor |
| --- | --- | --- |
| Bestel hier | winkelkarretje | verkoop, bv. maaltijden of wijn |
| Schrijf in | pen | inschrijven voor een activiteit |

Bewust geen vrij tekstveld: zo blijven de knoppen over de hele site hetzelfde en
hoort er bij elk opschrift altijd het juiste icoontje. De twee staan samen in
`REGISTRATION_OPTIONS` in `EventRegistrationButton.tsx` — het beheerpaneel leest
diezelfde lijst uit, dus een opschrift toevoegen doe je daar op één plek.

De knop verschijnt bij komende evenementen op alle drie de plaatsen waar een
evenement getoond wordt: de grote kaart bovenaan (en op de homepagina), het
kaartje op de tijdlijn en het detailvenster. Ze opent in een nieuw tabblad.

Ze moet opvallen, dus ze is geel en heeft een trage halo eromheen
(`.cta-glow` in `globals.css`, uit bij minder beweging). Om te vermijden dat er
twee gele knoppen naast elkaar staan te roepen, zakt **"Zet in agenda"** naar de
gedempte glazen stijl zodra er een actieknop is.

Vinkje weer uit en opslaan wist de link ook echt uit de database.

---

## Koppeling met de galerij

Hangt er een album aan een evenement, dan verschijnt er een knop naar
`/galerij?album=<nummer>`. De galerijpagina opent dat album dan meteen.

Koppelen doe je in het beheerpaneel, tab **Evenementen**: je kiest een bestaand
album of maakt er ter plekke een nieuw aan.

---

## Wat hardgecodeerd in de code staat

### `pages/public/EventsContent.tsx`
- De titel "Evenementen" en de ondertitel
- De tussentitel "Events"

### `lib/eventFormat.ts`
Alle datumopmaak, in het Nederlands (`nl-BE`): het dagnummer en de maand op het
gele blokje, de weekdag, de volledige datum en het uur.


### `sections/events/EventsTimeline.tsx`
De instellingen van de animatie: wanneer de bal begint te rollen, hoe snel de
lijn meekleurt, wanneer het pijltje oplicht.

---

## Bestanden uit `public/`

| Bestand | Waar |
| --- | --- |
| `VolleybalIcon.png` | De bal die langs de tijdlijn rolt |
| `assets/background-pattern.png` | Achtergrond in het detailvenster |

De bal wordt iets vergroot getoond, zodat de witte hoekjes van de PNG buiten het
ronde kadertje vallen.
