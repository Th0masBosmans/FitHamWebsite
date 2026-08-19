# Teams — `/teams` en `/teams/[id]`

Twee pagina's: het overzicht van alle ploegen, en de detailpagina van één ploeg.

## Welke bestanden

| Bestand | Wat het doet |
| --- | --- |
| `Frontend/pages/teams/index.tsx` | Adres van het overzicht |
| `Frontend/pages/teams/[teamId].tsx` | Adres van één team; haalt het nummer uit de URL |
| `Frontend/components/pages/public/TeamsContent.tsx` | Het overzicht |
| `Frontend/components/pages/public/TeamDetailContent.tsx` | De detailpagina |
| `Frontend/components/sections/teams/` | De blokken van beide pagina's |
| `Frontend/repository/teamRepository.ts` | Alle databasegesprekken over teams |
| `Frontend/repository/volleyRepository.ts` | Wedstrijd en rangschikking van de bond |

---

## Het overzicht (`/teams`)

Toont per afdeling een uitklapbaar blok met daarin de teamkaartjes.

De vier afdelingen en hun volgorde staan **hardgecodeerd** bovenaan
`TeamsContent.tsx`: jeugd, dames, heren, recreatie. Bij welke afdeling een team
hoort, kiest de beheerder per team. Afdelingen zonder teams krijgen geen blok.

### Gegevens
- Supabase-tabel `teams` (via `teamRepository.fetchTeams()`)
- Teamfoto's: Cloudinary

### Heeft een team geen foto?
Dan toont het kaartje een silhouet uit `public/`. Welk silhouet, wordt zo
bepaald (zie `sections/teams/TeamCard.tsx`):

- afdeling is **dames** → `WomenSilhouette.png`
- óf de teamnaam bevat het woord **"meisjes"** → `WomenSilhouette.png`
- in alle andere gevallen → `MenSilhouette.png`

---

## De detailpagina (`/teams/[id]`)

Van boven naar onder: teamfoto met de naam erover, een tekstje, de staf, de
spelerslijst, de trainingsuren naast de eerstvolgende wedstrijd, en onderaan de
rangschikking.

### Gegevens uit Supabase (eigen database)

Vier tabellen, allemaal opgehaald in één keer door `teamRepository.fetchTeam()`:

| Tabel | Wat erin zit |
| --- | --- |
| `teams` | Naam, omschrijving, afdeling, foto, reeks, clubnummer |
| `players` | De spelers, met hun positie |
| `staff` | Coaches en trainers, met foto |
| `training_days` | Dag + uur van elke training |

Spelers, staf en trainingen komen in willekeurige volgorde uit de database en
worden bij het ophalen op een vaste volgorde gezet, zodat de lijst niet telkens
anders staat.

De teamfoto en de staffoto's staan in **Cloudinary**.

### Gegevens van VolleyAdmin (niet van ons)

De wedstrijdkaart en de rangschikkingstabel komen **live** van `volleyadmin2.be`.
Die kan je niet aanpassen in het beheerpaneel.

Dit werkt alleen als de beheerder bij het team een **reeks** heeft ingevuld
(bv. `LHP1`). Is die leeg, dan verdwijnen beide blokken gewoon.

Optioneel kan er ook een **clubnummer** ingevuld worden; is dat leeg, dan
gebruiken we dat van Fit Ham zelf: `L-0759`.

De weg die de gegevens afleggen:

```
teampagina
  → repository/volleyRepository.ts
    → /api/proxy-matches.ts        (onze eigen server)
    → /api/proxy-rangschikking.ts
      → volleyadmin2.be
```

Die tussenstap via onze eigen server is nodig omdat de browser VolleyAdmin niet
rechtstreeks mag aanspreken.

### Welke wedstrijd getoond wordt

`pickWeekMatch()` in `volleyRepository.ts` kiest:

1. Speelt het team **deze week** (maandag t/m zondag)? Dan die wedstrijd — de
   eerste die nog niet gespeeld is, of anders de laatste van die week.
2. Zo niet: de eerstvolgende wedstrijd.
3. Is het seizoen gedaan: de laatst gespeelde wedstrijd.

### Kleine bijzonderheden

- Bij een paar reeksen heet de code in de rangschikking anders dan de code die
  wij tonen. Het lijstje dat dat vertaalt (`VDP2-B` → `LDM1`, `VDP4-B` → `LDM2`)
  staat in `volleyRepository.ts`.
- Ploegen van Fit Ham worden in de rangschikking opgelicht. Dat gebeurt door in
  de ploegnaam naar "ham" of "fit" te zoeken — dus een tegenstander met "ham" in
  de naam zou ook oplichten.

---

## Wat hardgecodeerd in de code staat

### `pages/public/TeamsContent.tsx`
- De vier afdelingen en hun volgorde en opschrift
- De twee knoppen onderaan:
  - **Twizzit** → `https://twizzit.com/fitham`
  - **Lid Worden** → `/membership`
- De teksten "Onze Teams" / "Alle teams van jong tot ervaren spelers."
- De boodschap als er nog geen enkel team is

### `types.ts`
De keuzelijstjes die de beheerder te zien krijgt:
- **Posities**: Receptie Hoek, Opposite, Spelverdeler, Midden, Libero, All Round
- **Stafrollen**: Coach, Assistent-Coach, Trainer
- **Afdelingen**: jeugd, dames, heren, recreatie

Wil je hier iets bijzetten, dan pas je `types.ts` aan (en let op dat wat al in
de database staat blijft kloppen).

### `repository/volleyRepository.ts`
- Het clubnummer van Fit Ham: `L-0759`
- Het vertaallijstje van reekscodes

---

## Bestanden uit `public/`

| Bestand | Waar |
| --- | --- |
| `MenSilhouette.png` | Vervangfoto, team zonder foto |
| `WomenSilhouette.png` | Vervangfoto, dames- of meisjesteam zonder foto |
| `twizziticon.png` | Icoontje op de Twizzit-knop |

De wedstrijdkaart heeft ook een knop "in agenda zetten". Die maakt ter plekke een
agenda-bestand aan — daar hoort geen bestand in `public/` bij.
