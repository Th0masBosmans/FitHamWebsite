# Onze Club — `/onze-club/*`

Het menu-item "Onze Club" is geen eigen pagina maar een uitklapmenu met een
pagina per onderwerp: Missie & Visie, Geschiedenis, Organigram,
Kwaliteitslabels, Verzekeringen en API.

## Welke bestanden

| Bestand | Wat het doet |
| --- | --- |
| `Frontend/components/sections/onze-club/clubTopics.ts` | De lijst onderwerpen: titel, ondertitel en adres. Voedt het menu én de paginatitels |
| `Frontend/components/pages/public/onze-club/ClubTopicContent.tsx` | Het casco van elke onderwerppagina: terugknop, titel en de inhoud |
| `Frontend/pages/onze-club/<onderwerp>.tsx` | Eén bestand per onderwerp, met de inhoud van die pagina |
| `Frontend/components/sections/layout/header/DesktopNav.tsx` | Het uitklapmenu op desktop |
| `Frontend/components/sections/layout/header/MobileNavDrawer.tsx` | Het openklapbare blok in het mobiele menu |
| `Frontend/components/sections/onze-club/IntegrityForm.tsx` | Het formulier op de API-pagina |
| `Frontend/pages/api/integrity.ts` | Mailt dat formulier door naar de API (draait op de server) |

Een pagina die nog geen inhoud meegeeft aan `ClubTopicContent`, toont een
"Binnenkort beschikbaar"-melding. Inhoud toevoegen = witte kaarten meegeven,
zoals in `verzekeringen.tsx` en `api.tsx`.

---

## Verzekeringen

Vaste tekst over de verzekering bij Ethias via Volley Vlaanderen en de termijn
van 8 dagen na een ongeval, met daaronder een downloadknop naar
`public/Verzekering.pdf`.

## API (Aanspreekpunt Integriteit)

Vaste uitleg over de API, met daaronder een formulier: naam en e-mail zijn
**optioneel**, alleen het bericht is verplicht. Laat de melder naam en e-mail
leeg, dan komt het bericht anoniem binnen.

```
formulier → /api/integrity → Gmail → mailadres van de API
```

- Het adres van de API komt uit de bestuursleden (tabel `board_members`): het
  bestuurslid met "api" of "aanspreekpunt" in de **functie**. Dat gebeurt op de
  server, dus niemand kan het adres vanuit de browser aanpassen.
- Staat er bij niemand zo'n functie, dan krijgt de bezoeker een foutmelding en
  wordt er niets verstuurd.
- Vult de melder een e-mailadres in, dan staat dat als antwoordadres op de mail
  en kan de API gewoon op antwoorden klikken. Zonder e-mail is er geen
  antwoordadres.
- Zelfde beveiliging als het contactformulier: Cloudflare Turnstile en een
  controle dat het bericht van onze eigen site komt (`lib/formGuard.ts`).
- Mailinstellingen: `SMTP_USER` en `SMTP_PASS` in `.env` (zie
  [contact.md](contact.md)). `CONTACT_TO` wordt hier **niet** gebruikt.

---

## Bestanden uit `public/`

| Bestand | Waar |
| --- | --- |
| `Verzekering.pdf` | De downloadknop op Verzekeringen |

Vervangen doe je door een nieuw PDF met dezelfde naam op dezelfde plek te zetten.
