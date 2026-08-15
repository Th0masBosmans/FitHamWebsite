# Lidmaatschap — `/membership` (en `/tickets`)

De lidgelden en het inschrijvingsformulier.

> `/tickets` toont **exact dezelfde pagina** als `/membership`. Beide adressen
> laden `MembershipContent`. Waarschijnlijk een overblijfsel; wil je er een
> echte ticketpagina van maken, dan pas je `Frontend/pages/tickets.tsx` aan.

## Welke bestanden

| Bestand | Wat het doet |
| --- | --- |
| `Frontend/pages/membership.tsx` | Het adres |
| `Frontend/pages/tickets.tsx` | Tweede adres naar dezelfde pagina |
| `Frontend/components/pages/public/MembershipContent.tsx` | Zet de pagina samen |
| `Frontend/components/sections/membership/PlanCard.tsx` | Eén lidgeld-kaartje |
| `Frontend/components/sections/membership/MembershipInfo.tsx` | De blokken eronder |
| `Frontend/components/sections/membership/RegistrationModal.tsx` | Het inschrijvingsvenster |
| `Frontend/components/sections/membership/registrationFields.tsx` | De invulvelden daarvan |
| `Frontend/pages/api/registration.ts` | Verstuurt de mail (draait op de server) |
| `Frontend/repository/membershipRepository.ts` | Gesprekken over lidgelden |
| `Frontend/lib/age.ts` | Berekent de leeftijd |

---

## De lidgeld-kaartjes

### Gegevens
Supabase-tabel `membership_fees`, gesorteerd op **prijs, goedkoopste eerst**.

Per lidgeld: naam, omschrijving, prijs (in hele euro's) en een lijstje voordelen.
Er komen **geen foto's** aan te pas — dit is de enige beheerbare pagina zonder
Cloudinary.

Alles wordt door de beheerder ingevuld in het beheerpaneel, tab **Lidgeld**. Er
staan dus geen prijzen in de code.

> ⚠️ In `Frontend/data/searchData.ts` staan wél prijzen (Starters €145,
> Recreatie €155, Jeugd €220, Volwassenen €270). Dat is losse zoektekst en
> verandert **niet** mee als je de prijzen in het beheerpaneel aanpast. Vergeet
> die niet bij te werken. Zie [gedeeld.md](gedeeld.md).

---

## Het inschrijvingsformulier

Opent als je op een lidgeld-kaartje klikt.

### Waar de inschrijving naartoe gaat

Net als het contactformulier: **niet naar de database**, maar per mail.

```
formulier → /api/registration → Gmail → clubmailbox
```

Zelfde instellingen uit `.env` als bij contact: `SMTP_USER`, `SMTP_PASS`,
`CONTACT_TO`. Er wordt niets bewaard.

### Jeugd of volwassene

Het formulier heeft twee gedaantes, gestuurd door `isYouth`:

| | Volwassene | Jeugd |
| --- | --- | --- |
| E-mail van de speler | gevraagd | niet gevraagd |
| Ervaring | vrij in te vullen tekst | alleen ja/nee |
| Gegevens ouder | niet gevraagd | gevraagd, met e-mail |
| Antwoord gaat naar | de speler | de ouder |

> ⚠️ `MembershipContent.tsx` geeft **altijd `isYouth={false}`** door. De
> jeugdversie van het formulier bestaat dus wel, maar wordt nooit getoond. Wil je
> die gebruiken, dan moet je per lidgeld bepalen of het om jeugd gaat en dat
> doorgeven.

### De leeftijd

Zodra er een geboortedatum ingevuld is, verschijnt de leeftijd eronder. Datzelfde
getal komt ook in de mail naar het bestuur en in het onderwerp, zodat het bestuur
meteen ziet in welke categorie iemand hoort.

Wordt op één plek berekend (`lib/age.ts`) en door beide gebruikt, zodat de twee
nooit uit elkaar kunnen lopen. Een onmogelijke datum (leeg, in de toekomst, ouder
dan 120) wordt geweigerd.

---

## De blokken onderaan

`MembershipInfo.tsx`, volledig hardgecodeerd:

**Verzekering** — een downloadknop naar `public/Verzekering.pdf`.

**Gratis Proeftraining** — een knop naar het contactformulier met het bericht al
ingevuld:

```
/contact?message=Ik wil me graag aanmelden voor een gratis proeftraining!#contact-form
```

De tekst van dat bericht staat als `PROEFTRAINING_MESSAGE` bovenaan het bestand.

---

## Wat hardgecodeerd in de code staat

### `pages/public/MembershipContent.tsx`
- De titel "Word nu Lid!" en de ondertitel
- Dat `isYouth` altijd `false` is

### `sections/membership/MembershipInfo.tsx`
- De volledige tekst van beide blokken
- Het bericht voor de proeftraining
- "Je kan tot 3 maal toe gratis proef trainen!"

### `sections/membership/RegistrationModal.tsx`
De veldnamen, de meldingen na het versturen, en de twee zinnetjes die als
ervaring meegestuurd worden bij jeugd ("Ja, heeft al eerder gevolleybald" /
"Nee, nog niet eerder gevolleybald").

---

## Bestanden uit `public/`

| Bestand | Waar |
| --- | --- |
| `Verzekering.pdf` | De downloadknop bij "Verzekering" |

Vervangen doe je door een nieuw PDF met dezelfde naam op dezelfde plek te zetten.
