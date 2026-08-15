# Galerij — `/galerij`

Foto- en video-albums, met bovenaan een diavoorstelling.

## Welke bestanden

| Bestand | Wat het doet |
| --- | --- |
| `Frontend/pages/galerij.tsx` | Het adres |
| `Frontend/components/pages/public/GalerijContent.tsx` | Zet de pagina samen, regelt het laden |
| `Frontend/components/sections/galerij/HeroCarousel.tsx` | De diavoorstelling bovenaan |
| `Frontend/components/sections/galerij/CategoryFilter.tsx` | De filterknoppen |
| `Frontend/components/sections/galerij/GalleryCard.tsx` | Eén albumkaartje |
| `Frontend/components/sections/galerij/MediaViewerModal.tsx` | Het venster om foto's te bekijken |
| `Frontend/repository/albumRepository.ts` | Alle gesprekken over albums |
| `Frontend/data/galleriesData.ts` | Vertaalt een databaserij naar wat de pagina toont |

---

## Waar de gegevens vandaan komen

Deze pagina is de enige plek waar **Cloudinary en Supabase Storage door elkaar
lopen**. Onthoud dit onderscheid:

| Wat | Waar het staat |
| --- | --- |
| Gegevens van het album (naam, datum, categorieën) | Supabase, tabel `albums` |
| De **cover** van het album | **Cloudinary** |
| De **foto's en filmpjes** in het album | **Supabase Storage**, map `albums` |
| Welke foto's in de diavoorstelling horen | Supabase, tabel `slideshow_images` |

Waarom die splitsing: de cover blijft op volle kwaliteit in Cloudinary staan
omdat hij groot getoond wordt. De losse albumfoto's zijn er vaak veel, en die
gaan naar Supabase Storage.

### Wat er gebeurt bij het uploaden

In het beheerpaneel, tab **Foto's**:

- **Foto's** worden in de browser verkleind naar maximaal 1920 pixels en als JPEG
  opnieuw opgeslagen vóór ze geüpload worden (`lib/imageCompression.ts`). Dat
  houdt de uploads snel.
- **Video's** gaan onveranderd omhoog — de browser kan die niet omzetten.
- Elk bestand krijgt een willekeurige naam; de oorspronkelijke bestandsnaam gaat
  dus verloren.

---

## Hoe de pagina laadt

### Albums per 15
De pagina haalt de eerste **15** albums op, nieuwste eerst. Onderaan verschijnt
"Meer laden" zolang er meer zijn. Dat aantal staat als `PAGE_SIZE` bovenaan
`GalerijContent.tsx`.

### De diavoorstelling bovenaan
Toont foto's die de beheerder zelf heeft uitgekozen uit de albums (tabel
`slideshow_images`). Heeft de beheerder nog niets gekozen, dan vallen we terug op
de covers van de geladen albums, zodat de banner nooit leeg is.

De diavoorstelling doet ook iets slims: voor elke foto rekent hij uit op welke
hoogte het interessante deel zit, zodat een staande foto in de brede banner niet
toevallig op de lucht of de vloer uitkomt. Dat gebeurt door de foto sterk te
verkleinen en te kijken waar het meeste contrast zit. Lukt dat niet, dan neemt
hij gewoon het midden.

### Rechtstreeks naar één album
Bij een evenement met een gekoppeld album staat een knop die hierheen linkt met
het albumnummer in het adres, bijvoorbeeld `/galerij?album=12`. De pagina haalt
dat album dan apart op en opent het meteen, ook als het niet bij de eerste 15
zat.

### Het bekijkvenster
Laadt telkens de twee foto's links en rechts van de huidige alvast op de
achtergrond, zodat vorige/volgende meteen scherp is. Al geladen foto's blijven
bewaard, ook nadat je het venster sluit — een album opnieuw openen gaat dus
sneller.

Bij albums met veel foto's worden onderaan niet alle bolletjes getoond, anders
passen ze niet op het scherm.

---

## Wat hardgecodeerd in de code staat

### `data/galleriesData.ts`
De vijf categorieën en hun opschrift:

| Sleutel | Wat de bezoeker ziet |
| --- | --- |
| `alles` | Alles |
| `wedstrijden` | Wedstrijden |
| `evenementen` | Evenementen |
| `jeugd` | Jeugd |
| `senioren` | Senioren |

Dit ene lijstje voedt zowel de filterknoppen op de galerijpagina als de
aankruisvakjes in het beheerpaneel. Een categorie bijzetten doe je hier.

Ook hardgecodeerd: welke bestandstypes als video gelden (`mp4`, `webm`, `ogg`,
`mov`, `m4v`). Alles wat daar niet in staat, wordt als foto behandeld.

### `pages/public/GalerijContent.tsx`
- Het aantal albums per keer (15)
- De teksten "Geen media gevonden in deze categorie" en "Meer laden"

### `repository/albumRepository.ts`
- De naam van de opslagmap: `albums`
- De maximumgrootte van een cover vóór hij toch verkleind wordt (10 MB)

---

## Bestanden uit `public/`

| Bestand | Waar |
| --- | --- |
| `assets/background-pattern.png` | Achtergrond naast de foto in het bekijkvenster |

Alle andere beelden op deze pagina komen uit Cloudinary of Supabase Storage.
