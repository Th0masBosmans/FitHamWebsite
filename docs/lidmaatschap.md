# Lidmaatschap — `/membership`

De lidgelden en het inschrijvingsformulier.

## Welke bestanden

| Bestand | Wat het doet |
| --- | --- |
| `Frontend/pages/membership.tsx` | Het adres |
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

### De velden

Eén vaste gedaante voor iedereen: e-mail, voornaam, naam, geboortedatum en een
vrij tekstvak voor eerdere volleybalervaring. Alles is verplicht.

Er was ooit een aparte jeugdvariant (ja/nee in plaats van een tekstvak, plus de
gegevens van een ouder), maar die werd nooit getoond en is verwijderd. Wil je ze
terug, dan moet je ze opnieuw bouwen — in zowel het formulier als
`/api/registration`.

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

### `sections/membership/MembershipInfo.tsx`
- De volledige tekst van beide blokken
- Het bericht voor de proeftraining
- "Je kan tot 3 maal toe gratis proef trainen!"

### `sections/membership/RegistrationModal.tsx`
De veldnamen, de voorbeeldtekst in het ervaringsvak en de meldingen na het versturen.

---

## Bestanden uit `public/`

| Bestand | Waar |
| --- | --- |
| `Verzekering.pdf` | De downloadknop bij "Verzekering" |

Vervangen doe je door een nieuw PDF met dezelfde naam op dezelfde plek te zetten.
