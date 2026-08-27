# Beheerpaneel — `/admin/*`

Waar de club de inhoud van de site aanpast. Niet bereikbaar via het menu: er zit
een klein slotje onderaan in de footer.

## Welke bestanden

| Adres | Bestand | Waarvoor |
| --- | --- | --- |
| `/admin/login` | `pages/admin/login.tsx` | Aanmelden |
| `/admin/dashboard` | `pages/admin/dashboard.tsx` | Het beheerpaneel zelf |
| `/admin/invite` | `pages/admin/invite.tsx` | Wachtwoord kiezen na een uitnodiging |
| `/admin/reset-password` | `pages/admin/reset-password.tsx` | Wachtwoord vergeten |
| `/admin/update-password` | `pages/admin/update-password.tsx` | Nieuw wachtwoord instellen |

De inhoud zit in `Frontend/components/pages/admin/`, de tabbladen in
`Frontend/components/sections/admin/`.

Beheerpagina's krijgen **geen** header en footer: `pages/_app.tsx` slaat die
over voor alles wat met `/admin` begint.

---

## Hoe de beveiliging werkt

Er zijn drie sloten, en dat is met opzet:

**1. De database zelf.** Supabase heeft per tabel regels (RLS) die bepalen wie
wat mag. Iedereen mag lezen; alleen wie de rol `admin` heeft mag aanpassen. Dit
is het echte slot — ook wie de site omzeilt komt er niet langs. Zie
`supabase/migrations/*_RLS_*.sql`.

**2. Het scherm.** `AdminDashboardContent.tsx` controleert bij het openen of er
een beheerder ingelogd is en stuurt anders door naar het inlogscherm. Zonder dat
zou het beheerscherm zichtbaar zijn voor iedereen die het adres kent — de knoppen
zouden niet werken, maar het zou er wel staan. Er wordt niets getoond tot de
controle rond is, zodat het paneel nooit even opflitst.

**3. De Cloudinary-routes.** `/api/cloudinary/sign-upload` en
`/api/cloudinary/delete-image` controleren zelf of de aanvraag van een beheerder
komt (`lib/requireAdmin.ts`). Zonder dat zou iedereen in onze Cloudinary kunnen
uploaden of foto's wissen.

### Nieuwe beheerders

Worden uitgenodigd vanuit het Supabase-dashboard, niet vanuit de site. De
uitgenodigde krijgt een mail met een link naar `/admin/invite` om een wachtwoord
te kiezen. De rol `admin` moet in Supabase op de gebruiker gezet worden
(in `app_metadata`).

`pages/_app.tsx` vangt die links op: staat er een Supabase-code in het adres, dan
stuurt hij door naar `/admin/invite` of `/admin/update-password`.

---

## De tabbladen

| Tabblad | Bestand | Wat het beheert | Waar het terechtkomt |
| --- | --- | --- | --- |
| Home | `SiteImagesManager.tsx` | De herobanner van de homepagina | `site_images` + Cloudinary |
| Teams | `TeamsManager.tsx` | Teams, spelers, staf, trainingen | `teams`/`players`/`staff`/`training_days` + Cloudinary |
| Foto's | `AlbumsManager.tsx` | Albums en de diavoorstelling | `albums` + Cloudinary (cover) + Supabase Storage (foto's) |
| Evenementen | `EventsManager.tsx` | De clubkalender | `events` + Cloudinary |
| Contact | `BoardManager.tsx` | De bestuursleden | `board_members` + Cloudinary |
| Lidgeld | `MembershipsManager.tsx` | De lidgelden | `membership_fees` (geen foto's) |
| Sponsors | `SponsorsManager.tsx` | De sponsorlogo's | `sponsors` + Cloudinary |

Elk tabblad regelt zijn eigen gegevens. De **albums** zijn de uitzondering: die
worden in `AdminDashboardContent.tsx` bijgehouden omdat twee tabbladen ze delen —
bij "Foto's" beheer je ze, bij "Evenementen" kan je er een aan een evenement
koppelen of ter plekke een nieuw album maken.

Bij "Evenementen" zit ook het vinkje **Actieknop**: aanvinken, een opschrift
en een link invullen (bv. naar Twizzit), en er verschijnt op de site een
opvallende knop bij dat evenement. Zie `docs/evenementen.md`.

### Gedeelde stukjes

| Bestand | Waarvoor |
| --- | --- |
| `AdminControls.tsx` | Knoppen, invulvelden, het uploadvak, het venster-omhulsel |
| `ExpandableListItem.tsx` | De uitklapbare regel die bijna elk tabblad gebruikt |
| `DeleteConfirmModal.tsx` | "Weet je het zeker?" vóór het verwijderen |
| `MultiAddToggle.tsx` + `AddedToast.tsx` + `useAddedToast.ts` | Meerdere items na elkaar toevoegen |
| `AlbumMediaGrid.tsx` + `SlideshowPanel.tsx` | Foto's binnen een album beheren |
| `adminHelpers.ts` | Losse hulpstukjes (datumopmaak, video herkennen) |

---

## Hoe uploaden werkt

Foto's gaan **niet** via onze server naar Cloudinary — dat zou traag zijn en veel
verkeer kosten. In plaats daarvan:

1. De browser verkleint de foto (`lib/imageCompression.ts`).
2. De browser vraagt aan `/api/cloudinary/sign-upload` een kortlopend
   toegangsbewijs. Die route controleert of je beheerder bent.
3. De browser stuurt de foto **rechtstreeks** naar Cloudinary.
4. Cloudinary geeft een korte code terug; die komt in de database.

Zo hoeft het geheime Cloudinary-wachtwoord nooit in de browser te staan.

### Maximumgroottes

| Wat | Verkleind tot | Waar ingesteld |
| --- | --- | --- |
| Sponsorlogo's | ~50 KB | standaardwaarde in `cloudinaryRepository.ts` |
| Teamfoto's, staf, bestuur, evenementen, banners | ~300 KB | per repository meegegeven |
| Albumcovers | tot 10 MB | `albumRepository.ts` (blijft scherp voor de diavoorstelling) |
| Foto's ín een album | max 1920 px, kwaliteit 70 | `albumRepository.ts` |
| Video's | niet verkleind | de browser kan dat niet |

### Als er iets misgaat

De repositories ruimen zichzelf op. Mislukt het opslaan in de database nadat de
foto al geüpload is, dan wordt die foto weer uit Cloudinary gehaald — anders
blijven er losse foto's achter waar niets meer naar verwijst. Bij het vervangen
van een foto wordt de oude pas verwijderd nadat de nieuwe goed opgeslagen is.

---

## Wat hardgecodeerd in de code staat

### `pages/admin/AdminDashboardContent.tsx`
De zeven tabbladen, hun volgorde en hun opschrift. Bij het openen staat
**Teams** open.

### `types.ts`
De namen van de tabbladen (`TabType`), en de keuzelijstjes voor posities,
stafrollen en afdelingen.

### `data/galleriesData.ts`
De categorieën die je bij een album kan aankruisen.

### `data/siteImageSlots.ts`
De plekken die je in het tabblad **Home** kan kiezen. Nu staat daar alleen
"Home - Herobanner" in.

---

## Bestanden uit `public/`

| Bestand | Waar |
| --- | --- |
| `FitHamLogo.png` | Het inlogscherm |
| `assets/background-pattern.png` | Achtergrond van het inlogscherm en de menubalk |
