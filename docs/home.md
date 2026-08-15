# Home — `/`

De startpagina.

## Welke bestanden

| Bestand | Wat het doet |
| --- | --- |
| `Frontend/pages/index.tsx` | Het adres. Haalt vooraf de herobanner op. |
| `Frontend/components/pages/public/HomeContent.tsx` | Zet de blokken hieronder onder elkaar. |
| `Frontend/components/sections/home/` | De blokken zelf. |

De pagina bestaat van boven naar onder uit:

1. `HomeHero` — de grote foto
2. `FeaturedEventSection` — het uitgelichte evenement
3. `AboutSection` — "Over ons"
4. `WebshopSection` — de webshop met kortingscode
5. `SocialMediaSection` — Facebook, Instagram, TikTok

`NextEventCountdown.tsx` staat wél in de map maar wordt **nergens gebruikt**. Het
is een aftelklok naar het eerstvolgende evenement. Wil je die terug, voeg hem dan
toe in `HomeContent.tsx`.

---

## Waar de gegevens vandaan komen

### De grote foto bovenaan — Supabase + Cloudinary

Instelbaar door de beheerder, en dit is de enige plek op de site die zo werkt.

De keten loopt zo:

1. In het beheerpaneel, tab **Home**, kiest de beheerder de plek
   "Home - Herobanner" en uploadt een foto.
2. De foto gaat naar **Cloudinary**; de verwijzing komt in de Supabase-tabel
   `site_images`, met `page = "home-hero"`.
3. `pages/index.tsx` vraagt bij het opbouwen van de pagina de foto met die
   sleutel op via `SiteImageRepository`.

De lijst met instelbare plekken staat in `Frontend/data/siteImageSlots.ts`. Wil
je elders op de site zo'n instelbare foto, dan zet je daar een regel bij.

De pagina wordt vooraf klaargezet en ververst zichzelf **elke 60 seconden**. Een
nieuwe banner is dus binnen de minuut zichtbaar, zonder de site opnieuw te
publiceren.

> ⚠️ **Als er géén banner ingesteld is**, valt de code terug op
> `/assets/hero-spirit.png` — en dat bestand bestaat niet in `public/assets/`.
> Dan zie je een gebroken afbeelding. Ofwel altijd een banner ingesteld houden,
> ofwel dat bestand alsnog toevoegen. Zie `sections/home/HomeHero.tsx`.

### Het uitgelichte evenement — Supabase + Cloudinary

`FeaturedEventSection` haalt alle evenementen op en kiest het komende evenement
waar de beheerder **Uitgelicht** bij aangevinkt heeft.

- Gegevens: Supabase-tabel `events`
- Affiche: Cloudinary
- Is er niets uitgelicht, dan verdwijnt het hele blok.

Het gebruikt exact dezelfde kaart als de evenementenpagina
(`sections/events/FeaturedEventCard.tsx`), zodat beide pagina's er hetzelfde
uitzien.

---

## Wat hardgecodeerd in de code staat

Dit staat **niet** in de database. Aanpassen = het bestand bewerken en opnieuw
publiceren.

### `sections/home/AboutSection.tsx`
De volledige tekst van "Over ons": de titel "Welkom bij Fit Ham!" en de twee
alinea's eronder, inclusief het linkje naar de sponsorpagina.

### `sections/home/WebshopSection.tsx`
- De titel "Fit Ham merchandise" en de tekst eronder
- Het adres van de webshop: `https://fitham.ninesquared.club/shop/`
- De regel "Gratis levering vanaf €50"

### `sections/home/DiscountCode.tsx`
- De kortingscode zelf: `R4QYA39R` (bovenaan het bestand, `DISCOUNT_CODE`)
- Het percentage "15% korting"

### `sections/home/SocialMediaSection.tsx`
De drie links:

| Knop | Adres |
| --- | --- |
| Facebook | `facebook.com/profile.php?id=100063627339831` |
| Instagram | `instagram.com/vcfitham/` |
| TikTok | `https://www.tiktok.com/` |

> ⚠️ De TikTok-link wijst naar de startpagina van TikTok, niet naar een
> clubaccount. Ofwel het echte adres invullen, ofwel de knop weghalen.

---

## Bestanden uit `public/`

| Bestand | Waar |
| --- | --- |
| `Webshop/merch-shirt.png` | Webshopblok, links (alleen op desktop) |
| `Webshop/merch-shorts.png` | Webshopblok, links (alleen op desktop) |
| `Webshop/merch-bag.png` | Webshopblok, rechts (alleen op desktop) |
| `Webshop/merch-socks.png` | Webshopblok, rechts (alleen op desktop) |
| `assets/hero-spirit.png` | Vervangfoto voor de banner — **ontbreekt** |

De vier merch-foto's zijn op mobiel verborgen; daar zie je alleen de
kortingscode in het midden.
