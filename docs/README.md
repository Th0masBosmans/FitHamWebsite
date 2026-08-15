# Fit Ham website — documentatie

Per pagina één bestand, met daarin: welke code de pagina opbouwt, waar de
gegevens vandaan komen, wat er hardgecodeerd in de code staat en welke
bestanden uit `public/` gebruikt worden.

| Pagina | Adres | Document |
| --- | --- | --- |
| Home | `/` | [home.md](home.md) |
| Teams + teamdetail | `/teams`, `/teams/[id]` | [teams.md](teams.md) |
| Galerij | `/galerij` | [galerij.md](galerij.md) |
| Evenementen | `/events` | [evenementen.md](evenementen.md) |
| Contact | `/contact` | [contact.md](contact.md) |
| Lidmaatschap | `/membership`, `/tickets` | [lidmaatschap.md](lidmaatschap.md) |
| Sponsors | `/sponsors` | [sponsors.md](sponsors.md) |
| Beheerpaneel | `/admin/*` | [beheer.md](beheer.md) |

Daarnaast: [gedeeld.md](gedeeld.md) — de header, de footer, het zoekvenster en
het opstartscherm, die op élke pagina staan.

---

## De drie plekken waar gegevens vandaan komen

Dit is het belangrijkste om te onthouden. Zoek je waar iets vandaan komt, dan is
het altijd één van deze drie:

### 1. Supabase — de database

Alle tekst en gegevens die een beheerder kan aanpassen: teams, spelers,
evenementen, sponsors, lidgelden, bestuursleden, albums.

Verbinding: `Frontend/supabase.ts`. Tabellen: `Frontend/repository/*.ts`.
De tabellen zelf zijn aangemaakt in `supabase/migrations/`.

Supabase heeft óók een tweede rol: **Supabase Storage**, map `albums`. Daar
staan de foto's en filmpjes ín een album.

### 2. Cloudinary — de foto's

Bijna elke losse foto: teamfoto's, staffoto's, affiches van evenementen,
sponsorlogo's, profielfoto's van het bestuur, de albumcovers en de herobanner.

In de database staat nooit de foto zelf, alleen een korte code (het "public id")
die naar Cloudinary verwijst. Het omzetten naar een echt webadres gebeurt in
`Frontend/repository/cloudinaryRepository.ts`.

> **Let op het verschil bij albums:** de **cover** staat in Cloudinary, maar de
> **foto's in het album** staan in Supabase Storage. Dat is de enige plek waar
> beide door elkaar lopen.

### 3. VolleyAdmin — de competitie

De wedstrijdkalender en de rangschikking komen live van `volleyadmin2.be`, de
site van de volleybalbond. Dit is **niet van ons** en kan niet aangepast worden
via het beheerpaneel.

Loopt via `Frontend/repository/volleyRepository.ts` en de twee tussenroutes
`Frontend/pages/api/proxy-matches.ts` en `proxy-rangschikking.ts` (de browser
mag VolleyAdmin niet rechtstreeks aanspreken).

Alleen zichtbaar bij teams waar de beheerder een **reeks** heeft ingevuld.

### En wat er in géén van de drie zit

Veel tekst staat gewoon in de code. Per pagina staat hieronder precies wat.
Om die aan te passen moet je het bestand bewerken en de site opnieuw publiceren.

---

## Hoe de mappen in elkaar zitten

```
Frontend/
  pages/              De adressen van de site. Bewust héél kort gehouden:
                      elke pagina wijst alleen door naar components/pages/.
    api/              Code die op de server draait (mail, Cloudinary, VolleyAdmin)
    admin/            De adressen van het beheerpaneel

  components/
    ui/               Kleine bouwsteentjes die overal terugkomen
                      (het gele balkje, paginatitel, tussentitel)
    sections/         De blokken waaruit een pagina bestaat, per onderwerp
                      gegroepeerd: home/, teams/, events/, galerij/, contact/,
                      membership/, layout/, search/, admin/
    pages/            Wat een pagina echt toont: de blokken uit sections/
                      samengezet tot één geheel
      public/         de gewone pagina's
      admin/          het beheerpaneel

  repository/         Alle gesprekken met Supabase, Cloudinary en VolleyAdmin.
                      Eén bestand per onderwerp.
  lib/                Losse hulpstukjes (datums, mail, zoeken, foto's verkleinen)
  data/               Vaste lijstjes die in de code staan
  styles/             globals.css: kleuren, lettertypes, tekstformaten
  public/             Bestanden die onveranderd op de site staan

supabase/migrations/  De opbouw van de database
docs/                 Deze documentatie
```

### Twee mappen die `pages` heten

- `Frontend/pages/` → **de adressen** van de site. Next.js maakt van elk bestand
  hier automatisch een webadres.
- `Frontend/components/pages/` → **de inhoud** van die pagina's.

Waarom gesplitst: zo blijft `pages/` een overzichtelijk lijstje van alle
adressen, en zit de echte code ergens waar je hem samen met de rest van de
componenten vindt.

---

## Alles in `public/`

Deze bestanden staan onveranderd op de site. Wil je er één vervangen, zet er dan
een nieuw bestand met **dezelfde naam** neer.

| Bestand | Waarvoor | Gebruikt in |
| --- | --- | --- |
| `FitHamLogo.png` | Het clublogo | Header, opstartscherm, inlogscherm beheer |
| `assets/background-pattern.png` | Het vage patroon in de achtergrond | Elke pagina, fotoviewer, beheerpaneel |
| `VolleybalIcon.png` | De bal die langs de tijdlijn rolt | Evenementenpagina |
| `MenSilhouette.png` | Vervangfoto als een herenteam geen foto heeft | Teams |
| `WomenSilhouette.png` | Vervangfoto als een damesteam geen foto heeft | Teams |
| `twizziticon.png` | Icoontje op de Twizzit-knop | Teams |
| `Verzekering.pdf` | De verzekeringspapieren om te downloaden | Lidmaatschap |
| `Webshop/merch-shirt.png` | Shirt | Home, webshopblok |
| `Webshop/merch-shorts.png` | Short | Home, webshopblok |
| `Webshop/merch-bag.png` | Rugzak | Home, webshopblok |
| `Webshop/merch-socks.png` | Sokken | Home, webshopblok |

### Twee dingen om te weten

**`assets/hero-spirit.png` ontbreekt.** De homepagina valt op dit bestand terug
als er in het beheerpaneel géén herobanner is ingesteld — maar het bestaat niet
in `public/assets/`. Zolang er wel een banner ingesteld staat merk je er niets
van. Zie [home.md](home.md).

**`ProfilePictures/` wordt niet meer gebruikt.** De drie foto's daarin
(`DimiProfile.png`, `JasperProfile.jpg`, `JolienProfile.webp`) zijn overblijfsels
van vroeger. De foto's van het bestuur komen nu uit Cloudinary en worden in het
beheerpaneel geüpload. Deze map mag weg.

---

## Instellingen (`.env`)

Staat in `Frontend/.env` en hoort niet in git.

| Sleutel | Waarvoor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Adres van de database |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publieke sleutel van de database |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Naam van de Cloudinary-account |
| `CLOUDINARY_API_KEY` | Geheim — alleen op de server |
| `CLOUDINARY_API_SECRET` | Geheim — alleen op de server |
| `SMTP_USER` | Gmail-adres waarmee mail verstuurd wordt |
| `SMTP_PASS` | App-wachtwoord van dat Gmail-adres |
| `CONTACT_TO` | Waar contact- en inschrijvingsmails naartoe gaan |

Alles met `NEXT_PUBLIC_` ervoor is zichtbaar in de browser. De rest niet, en dat
moet zo blijven.
