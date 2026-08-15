# Gedeeld — wat op elke pagina staat

De header, de footer, het zoekvenster, het opstartscherm en de achtergrond. Alles
wat je op élke publieke pagina ziet.

Het geheel wordt samengehouden door `Frontend/pages/_app.tsx`. Dat bestand hangt
om elke pagina heen: de achtergrond, de header, de inhoud, de footer. Voor
`/admin`-pagina's slaat het dat allemaal over.

---

## De header

`Frontend/components/sections/layout/Header.tsx`

Van links naar rechts: het logo, en een schuin afgesneden blauw vlak met daarin
de menulinks, het zoekveld en (op mobiel) de hamburgerknop.

| Bestand | Wat het doet |
| --- | --- |
| `Header.tsx` | Houdt alles samen |
| `header/navLinks.ts` | **De menulinks** |
| `header/DesktopNav.tsx` | De links op brede schermen |
| `header/MobileNavDrawer.tsx` | Het uitschuifmenu op mobiel |
| `header/HeaderSearch.tsx` | Het zoekveld |

### De menulinks

Staan hardgecodeerd in `header/navLinks.ts`. Dit ene lijstje voedt zowel de
desktopbalk als het mobiele menu — een pagina toevoegen doe je dus op één plek.

| Opschrift | Adres |
| --- | --- |
| Home | `/` |
| Teams | `/teams` |
| Foto's | `/galerij` |
| Evenementen | `/events` |
| sponsors | `/sponsors` |
| Contact | `/contact` |

> Kleinigheid: "sponsors" staat er met een kleine letter tussen de andere. In de
> weergave wordt alles toch in hoofdletters gezet, dus je ziet het niet.

Merk op dat `/membership` **niet** in het menu staat. Die pagina bereik je via de
knop "Lid Worden" op de teampagina.

### Het schuine blauwe vlak

De breedte verandert mee met het scherm en met of het zoekveld open staat. Dat
kan niet met gewone opmaakregels, vandaar dat `lib/useIsDesktop.ts` in
JavaScript bijhoudt of het scherm breed genoeg is (vanaf 1024px).

---

## Het zoekvenster

| Bestand | Wat het doet |
| --- | --- |
| `header/HeaderSearch.tsx` | Het invulveld |
| `sections/search/SearchResults.tsx` | Het resultatenpaneel |
| `lib/siteSearch.ts` | Het zoeken zelf |
| `data/searchData.ts` | **De doorzochte tekst** |

> ⚠️ **Het zoeken doorzoekt de website niet.** Het doorzoekt een handgeschreven
> lijst in `data/searchData.ts`. Die staat helemaal los van de echte pagina's en
> van de database.

Dat betekent:

- Nieuwe tekst op de site is **niet** vindbaar tenzij je ze daar ook toevoegt.
- Verandert er iets (een prijs, een sponsornaam), dan blijft de oude tekst
  vindbaar tot je ze daar aanpast.

**Wat er nu niet meer klopt in `searchData.ts`:**

- De lidgeldprijzen (Starters €145, Recreatie €155, Jeugd €220, Volwassenen €270)
  staan er vast in, terwijl de echte prijzen uit de database komen.
- Er staat een lijst sponsornamen in (Sport Direct Limburg, De Limburgse Bank,
  ...) die niet uit de database komt.
- Er staat een adres "Sporthal De Basis, Hamont-Achel" in, terwijl de footer
  "Sporthal t'Vlietje, Sportlaan 10a, 3945 Ham" toont.
- Er staan openingsuren in ("Maandag tot vrijdag: 09:00 - 18:00") die nergens op
  de site staan.

Het zoeken begint vanaf **2 getypte letters**. Resultaten worden gesorteerd op
waar de zoekterm het vroegst in de tekst voorkomt, en de gevonden woorden worden
geel gemarkeerd.

---

## De footer

`Frontend/components/sections/layout/Footer.tsx`

Bevat:

**De sponsorcarrousel.** Haalt de sponsors uit Supabase (logo's uit Cloudinary)
en schuift elke 3 seconden door. Op mobiel 3 logo's, op desktop 5. Klikken
brengt je naar `/sponsors`. Zie [sponsors.md](sponsors.md).

**Het adres.** Hardgecodeerd: "Sporthal t'Vlietje — Sportlaan 10a, 3945 Ham".
Klikken opent Google Maps.

**De copyrightregel.** Hardgecodeerd: "© 2026 Fit Ham. Alle rechten voorbehouden."
Dit jaartal loopt niet vanzelf mee.

**Het slotje.** Het kleine hangslotje rechts van de copyrightregel is de enige
ingang naar `/admin/login`.

---

## Het opstartscherm

`Frontend/components/sections/layout/SplashScreen.tsx`

Het logo met een gloed erachter, bij het eerste laden van de site. Verdwijnt
zodra alles geladen is, met een minimale duur zodat een snelle laadbeurt niet als
een flits overkomt, en een noodrem zodat de bezoeker nooit vast blijft zitten als
er iets blijft hangen.

---

## Terug naar boven

`Frontend/components/sections/layout/ScrollToTop.tsx`

Springt bij elke paginawissel terug naar boven. Zonder dit blijf je na het
klikken op een link hangen op de hoogte waar je stond. Toont zelf niets.

---

## De achtergrond

Staat in `pages/_app.tsx`: een kleurverloop van lichtblauw (`#5cd6ff`) naar het
clubblauw, met daaroverheen `public/assets/background-pattern.png` op 6%
doorzichtigheid, herhaald op 540 pixels.

---

## Kleuren en tekstformaten

`Frontend/styles/globals.css` — één bestand van zo'n 180 regels.

| Naam | Kleur | Waarvoor |
| --- | --- | --- |
| `--color-primary-brand` | `#004aad` | Het clubblauw |
| `--color-secondary-brand` | | Het lichtere blauw voor verlopen |
| `--color-accent` | `#facc15` | Het geel van de balkjes en knoppen |

Daarnaast staan er tekstformaten in (`title-page`, `title-section`,
`body-large`, `label-regular`, ...) die op mobiel en desktop andere groottes
krijgen. Gebruik die in plaats van losse lettergroottes, dan blijft alles
samenhangen.

Ook hier: de animatie `api-highlight`, die een bestuurslid laat oplichten als je
op de contactpagina op de API-link klikt. Zie [contact.md](contact.md).

---

## Titel en omschrijving van de site

- `pages/_app.tsx` — de titel in het browsertabblad: "Fit Ham"
- `pages/_document.tsx` — de taal (`nl`) en de omschrijving die zoekmachines
  tonen

Beide hardgecodeerd, en voor de hele site hetzelfde: losse pagina's hebben geen
eigen titel of omschrijving.
