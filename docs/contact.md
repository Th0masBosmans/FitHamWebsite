# Contact — `/contact`

Contactformulier, uitleg over het Aanspreekpunt Integriteit, en de bestuursleden.

## Welke bestanden

| Bestand | Wat het doet |
| --- | --- |
| `Frontend/pages/contact.tsx` | Het adres |
| `Frontend/components/pages/public/ContactContent.tsx` | Zet de drie blokken onder elkaar |
| `Frontend/components/sections/contact/ContactForm.tsx` | Het formulier |
| `Frontend/components/sections/contact/IntegrityContact.tsx` | Het API-blok |
| `Frontend/components/sections/contact/BoardMembers.tsx` | De bestuursleden |
| `Frontend/pages/api/contact.ts` | Verstuurt de mail (draait op de server) |
| `Frontend/lib/mail.ts` | De opmaak van de mail |
| `Frontend/repository/boardMemberRepository.ts` | Gesprekken over bestuursleden |

---

## Het contactformulier

### Waar het bericht naartoe gaat

**Niet naar de database.** Het formulier stuurt naar `/api/contact`, en die
maakt er een mail van.

```
formulier → /api/contact → Gmail → clubmailbox
```

De instellingen staan in `.env`:

| Sleutel | Waarvoor |
| --- | --- |
| `SMTP_USER` | Het Gmail-adres waarmee verstuurd wordt |
| `SMTP_PASS` | Het app-wachtwoord daarvan |
| `CONTACT_TO` | Waar de mail naartoe gaat (leeg = naar `SMTP_USER` zelf) |

Er wordt **niets bewaard**: is de mail verstuurd, dan is het bericht weg uit de
site. Zijn de instellingen niet ingevuld, dan krijgt de bezoeker een nette
foutmelding.

De mail zet het antwoordadres op dat van de bezoeker, zodat het bestuur gewoon
op de mail kan antwoorden.

### De velden

Verplicht: **e-mail**, **telefoonnummer** en **bericht**. Voornaam en naam mogen
leeg blijven.

### Vooraf ingevuld bericht

Er kan een bericht meegegeven worden in het adres. Zo linkt de knop "Gratis
proeftraining" op de lidmaatschapspagina hierheen met de tekst al ingevuld:

```
/contact?message=Ik%20wil%20me%20graag%20aanmelden...#contact-form
```

Het stukje `#contact-form` zorgt ervoor dat de pagina meteen naar het formulier
scrolt.

---

## Het API-blok

`IntegrityContact.tsx` — vaste uitleg over het Aanspreekpunt Integriteit.

Onderaan staat een link "neem contact op met onze API". Die scrolt naar het
juiste bestuurslid in de lijst eronder en laat dat even oplichten.

Hoe dat bestuurslid gevonden wordt: er wordt in de **functieomschrijving**
gezocht naar het woord "api" of "aanspreekpunt". Staat er bij niemand zoiets, dan
scrolt de link gewoon naar het begin van de bestuurslijst.

> Wil je dit laten werken, zet dan bij het juiste bestuurslid iets als
> "Aanspreekpunt Integriteit" of "API" als functie in het beheerpaneel.

Het oplichten gebeurt met de opmaakregel `api-highlight` in
`Frontend/styles/globals.css`.

---

## De bestuursleden

### Gegevens
- Supabase-tabel `board_members` (naam, functie, e-mailadres)
- Profielfoto's: **Cloudinary**
- Op volgorde van toevoegen

Elk kaartje is een `mailto:`-link: erop klikken opent het mailprogramma van de
bezoeker.

Zijn er nog geen bestuursleden, dan verdwijnt het hele blok.

> Bestuursfoto's komen uit Cloudinary en worden in het beheerpaneel
> (tab **Contact**) geüpload.

---

## Wat hardgecodeerd in de code staat

### `pages/public/ContactContent.tsx`
De titel "Contact" en de ondertitel "Neem contact met ons op!"

### `sections/contact/ContactForm.tsx`
De tussentitel "Stuur een bericht", alle veldnamen, de voorbeeldteksten in de
velden (`jouw@email.be`, `(+32 470 12 34 56)`), en de meldingen na het versturen.

### `sections/contact/IntegrityContact.tsx`
De **volledige tekst** van het API-blok: de drie alinea's over wat een
Aanspreekpunt Integriteit is en waar de club voor staat.

### `lib/mail.ts`
De opmaak van de mail: de blauwe kop, het tabelletje met gegevens en het
berichtvak. De kleuren staan daar hard ingesteld, omdat mailprogramma's de
kleuren van de website niet kennen.

---

## Bestanden uit `public/`

Geen enkel bestand specifiek voor deze pagina. De profielfoto's komen uit
Cloudinary.
