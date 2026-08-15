# Sponsors — `/sponsors`

Alle sponsorlogo's in een raster, met onderaan een oproep om zelf sponsor te
worden.

## Welke bestanden

| Bestand | Wat het doet |
| --- | --- |
| `Frontend/pages/sponsors.tsx` | Het adres |
| `Frontend/components/pages/public/SponsorsContent.tsx` | De hele pagina |
| `Frontend/repository/sponsorRepository.ts` | Gesprekken over sponsors |

Dit is de eenvoudigste pagina van de site: er zijn geen aparte blokken voor, alles
staat in dat ene bestand.

---

## Waar de gegevens vandaan komen

- Supabase-tabel `sponsors`: naam en (optioneel) website
- Logo's: **Cloudinary**

Er wordt **geen volgorde** opgegeven bij het ophalen, dus de volgorde ligt niet
vast. Wil je die kunnen bepalen, dan moet er een sorteerveld bij in de tabel.

Sponsorlogo's worden bij het uploaden sterker verkleind dan andere foto's
(tot ongeveer 50 KB, tegenover 300 KB elders) — het zijn kleine afbeeldingen die
op veel plaatsen tegelijk getoond worden.

### Heeft een sponsor geen website?

Dan is het logo gewoon een plaatje zonder link. Het hover-effect met de naam en
de knop "Bezoek website" verschijnt alleen bij sponsors mét website.

---

## Waar sponsors nog meer opduiken

De **footer** van elke pagina toont dezelfde sponsors in een carrousel die
vanzelf doorschuift (elke 3 seconden). Klikken brengt je naar deze pagina.

Die carrousel toont op mobiel 3 logo's (één groot in het midden, twee kleinere
ernaast) en op desktop 5. Zie `Frontend/components/sections/layout/Footer.tsx` en
[gedeeld.md](gedeeld.md).

---

## Wat hardgecodeerd in de code staat

Alles buiten de logo's zelf, in `SponsorsContent.tsx`:

- De terugknop naar de homepagina
- De titel "Sponsors" en de volledige ondertitel ("Dankzij de steun van onze
  sponsors...")
- Het oproepblok onderaan: "Word ook sponsor!", de tekst eronder en de knop
  "Neem Contact Op" die naar `/contact` gaat
- De tekst "Bezoek website" die bij hover verschijnt

> ⚠️ In `Frontend/data/searchData.ts` staat nog een lijst met sponsornamen (Sport
> Direct Limburg, De Limburgse Bank, ...) als zoektekst. Die verandert **niet**
> mee met de echte sponsors in de database en klopt waarschijnlijk niet meer.
> Zie [gedeeld.md](gedeeld.md).

---

## Bestanden uit `public/`

Geen. Alle logo's komen uit Cloudinary.
