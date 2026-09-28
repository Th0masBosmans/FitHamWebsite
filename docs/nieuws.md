# Nieuws — `/nieuws` en `/nieuws/[slug]`

Berichten die te veel uitleg vragen voor een evenementkaartje en daarom een eigen
pagina krijgen. Het eerste is **Smash Squad**, de nieuwe jeugdwerking:
`/nieuws/smash-squad`.

Een nieuwsbericht is bewust hetzelfde idee als een evenement — een titel, een
foto, een inleiding en een actieknop — met twee verschillen:

- er hoort geen datum-en-uur bij, dus geen tijdlijn en geen agenda-knop;
- de inhoud eronder stelt de beheerder zelf samen uit **blokken**.

## Welke bestanden

| Bestand | Wat het doet |
| --- | --- |
| `Frontend/pages/nieuws/index.tsx` | Het adres van het overzicht |
| `Frontend/pages/nieuws/[slug].tsx` | Het adres van één bericht; zet ook de tabbladtitel |
| `Frontend/components/pages/public/NewsContent.tsx` | Het overzicht |
| `Frontend/components/pages/public/NewsArticleContent.tsx` | De pagina van één bericht |
| `Frontend/components/sections/news/NewsCard.tsx` | Het kaartje van een bericht |
| `Frontend/components/sections/news/NewsSlideshow.tsx` | De grote kaart met de uitgelichte berichten, die elkaar afwisselen |
| `Frontend/components/sections/news/NewsBlocks.tsx` | De blokken waaruit een pagina bestaat |
| `Frontend/components/sections/home/NewsSection.tsx` | Het nieuwsblok op de homepagina |
| `Frontend/repository/newsRepository.ts` | Alle gesprekken over nieuws |
| `Frontend/components/sections/admin/NewsManager.tsx` | Het tabblad in het beheerpaneel |
| `Frontend/components/sections/admin/NewsBlocksEditor.tsx` | Het samenstellen van de blokken |
| `Frontend/components/sections/admin/newsBlocks.ts` | De lijst met soorten blokken |

---

## Waar de gegevens vandaan komen

Alles uit de Supabase-tabel `news_articles`; de foto's uit **Cloudinary**.

Per bericht: een webadres, een titel, een ondertitel, een inleiding, een
hoofdfoto, of het op de homepagina staat, optioneel een actieknop, en de blokken.

### De datum

Die vult niemand in. `published_at` zet de database bij het aanmaken, en
`updated_at` wordt bij elke keer opslaan bijgewerkt. Is een bericht na het
aanmaken nog gewijzigd, dan toont de site die laatste datum als "Bijgewerkt op",
anders "Gepubliceerd op". Het gele datumblokje op het kaartje volgt hetzelfde.
Die keuze zit in `articleDate()` in `newsRepository.ts`.

De **hoofdfoto mag leeg blijven**. Dan toont de pagina in plaats daarvan een
gekleurd vlak met een klein icoontje — handig als de tekst er al is maar het
beeldmateriaal nog niet.

### Het webadres (de "slug")

Het stukje achter `/nieuws/`. Het volgt vanzelf uit de titel ("Smash Squad" wordt
`smash-squad`), maar de beheerder mag het aanpassen. Twee berichten mogen niet
hetzelfde webadres hebben; de database weigert dat en het beheerpaneel zegt het
in gewone woorden.

> Let op: verander je het webadres van een bestaand bericht, dan werken links die
> elders al gedeeld zijn niet meer.

---

## De blokken

Alles onder de kop van de pagina staat in één kolom `blocks` in de database, als
JSON. Daardoor hoeft er voor een nieuw soort blok géén kolom bij.

| Soort | Wat je ziet |
| --- | --- |
| **Tekst** | Een tussentitel met lopende tekst. Een lege regel maakt een nieuwe alinea. |
| **Kaarten** | Een rij kaartjes met een titel, een regel eronder, tekst en een opsomming. Voor groepen, stappen, formules. |
| **Vragen** | Veelgestelde vragen die open- en dichtklappen. Er staat er altijd maar één open. |
| **Foto's** | Een fotoraster. Klik je een foto aan, dan komt ze groot over de pagina. |
| **Knoppen** | Een rij actieknoppen met een eigen opschrift en link. Kies per knop "opvallend" (geel) of "gedempt"; hou het bij één gele per rij. |
| **Locatie** | Eén of meer plekken (naam en adres). Elke plek wordt een tegel met een Google Maps-kaartje; aantikken opent de route. Het adres hoeft niet volledig te zijn zolang Google de plek vindt. |

De beheerder voegt een blok toe met de tegels onder de lijst (het komt onderaan
te staan en schuift vanzelf in beeld), verplaatst het met de pijltjes en gooit
het weg met het prullenbakje.

### Een soort blok bijmaken

Op **twee** plekken, meer niet:

1. `sections/admin/newsBlocks.ts` — de soort in `NEWS_BLOCK_TYPES` zetten en er
   in `emptyBlock` een lege vorm bij geven.
2. `sections/news/NewsBlocks.tsx` — tekenen hoe het eruitziet.

De vorm zelf (welke velden erin zitten) staat bij het type `NewsBlock` in
`Frontend/types.ts`.

---

## De foto's van een fotoblok

Die gaan naar **Cloudinary**, net als de hoofdfoto — niet naar Supabase Storage
zoals de foto's ín een album. Ze worden verkleind tot ongeveer 3 MB.

Belangrijk in het beheerpaneel: gekozen foto's worden **pas bij het opslaan**
geüpload. Sluit je het venster tussendoor, dan is er niets gebeurd. Foto's met
een geel randje zijn nog niet opgeslagen.

Ruimt zichzelf op: haal je een foto uit een blok en sla je op, dan gaat ze ook
echt uit Cloudinary weg. Hetzelfde bij het vervangen van de hoofdfoto en bij het
verwijderen van een heel bericht.

---

## De actieknop

Dezelfde als bij een evenement, met dezelfde twee vaste opschriften ("Bestel
hier" en "Schrijf in") uit `sections/events/EventRegistrationButton.tsx`. Zo zien
de knoppen er over de hele site hetzelfde uit. Ze staat op een nieuwspagina
bovenaan bij de inleiding, naast de knop "Stel je vraag".

---

## Waar een bericht overal opduikt

| Plek | Wat er staat |
| --- | --- |
| Homepagina | De berichten met **Tonen op de homepagina** aangevinkt, in één grote kaart onder het uitgelichte evenement. Meerdere wisselen elkaar om de 6 seconden af, met bolletjes eronder |
| `/nieuws` | Bovenaan dezelfde grote kaart met de uitgelichte berichten (of het recentste als er niets uitgelicht is), daaronder de rest in een raster van twee |
| `/nieuws/<slug>` | De pagina zelf |
| Het menu | **Niet** in het menu — zie hieronder |

### Waarom `/nieuws` niet in het menu staat

De menubalk op desktop zit vol. De links staan in een vast gecentreerd blok in
het schuine blauwe vlak; komt er een zevende bij, dan schuift het blok links
voorbij de rand van dat vlak en staan "Home" en "Teams" als witte tekst op de
witte achtergrond naast het logo. Dat gebeurt tussen ongeveer 1024 en 1130 pixels
breed — met zes links zit het daar al op de rand.

De weg naar het nieuws loopt dus via het blok op de homepagina en via de knop
"Al het nieuws" op een nieuwspagina, net zoals `/membership` alleen via de knop
"Lid Worden" te bereiken is.

Wil je het er tóch bij: dan moet eerst de menubalk zelf ruimte krijgen (het blauwe
vlak breder, of de links kleiner vanaf `lg`), anders breekt de balk.

Op de homepagina en op het overzicht is dat telkens hetzelfde kaartje
(`NewsCard`). De foto vult het; standaard zie je enkel het gele datumblokje en de
titel, en op een breed scherm schuift de inleiding omhoog zodra je met de muis
over de kaart gaat. Op een gsm blijven de inleiding en de ondertitel weg: daar
staan enkel de titel en de knop "Lees meer".

---

## Wat hardgecodeerd in de code staat

### `pages/public/NewsContent.tsx`
De titel "Nieuws" en de ondertitel van het overzicht.

### `pages/public/NewsArticleContent.tsx`
- De knop "Al het nieuws" bovenaan en "Stel je vraag" naast de actieknop
- De regel "Gepubliceerd op ..." / "Bijgewerkt op ..."

### `sections/news/NewsCard.tsx`
Het label "Nieuws" rechtsboven en het opschrift "Lees meer".

De rest — élke tekst die een bezoeker leest — komt uit de database.

---

## De tekst van Smash Squad

Het bericht zelf staat in
`supabase/migrations/20260909120200_news_articles_smash_squad.sql`. Dat is
eenmalig: het zet de tekst klaar in de database. Wijzigen doe je daarna gewoon in
het beheerpaneel, niet in dat bestand.

De hoofdfoto staat er niet in — die moet nog geüpload worden in het
beheerpaneel, tabblad **Home**, onder "Nieuws".
