import type { NextApiRequest, NextApiResponse } from "next";
import { calculateAge } from "@/lib/age";
import { buildMailHtml, buildMailText, escapeHtml, getMailConfig, type MailRow } from "@/lib/mail";

// Ontvangt een inschrijving vanaf de lidmaatschapspagina
// (sections/membership/RegistrationModal) en mailt een overzichtje naar de club,
// zodat het bestuur meteen ziet wie lid wil worden, hoe oud die is en welke
// ervaring die heeft. De opmaak van de mail zit in lib/mail.

type RegistrationBody = {
  planName?: string;
  playerFirstName?: string;
  playerLastName?: string;
  birthDate?: string;
  email?: string;
  experience?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (req.body ?? {}) as RegistrationBody;

  const firstName = body.playerFirstName?.trim();
  const lastName = body.playerLastName?.trim();
  // Bij jeugd antwoordt het bestuur aan de ouder, anders aan de speler zelf.
  const replyEmail = (body.parentEmail || body.email)?.trim();

  if (!firstName || !lastName || !body.birthDate || !replyEmail) {
    return res.status(400).json({ error: "Vul alle verplichte velden in" });
  }

  const age = calculateAge(body.birthDate);
  if (age === null) {
    return res.status(400).json({ error: "Geboortedatum is ongeldig" });
  }

  const mail = getMailConfig();
  if (!mail) {
    return res.status(500).json({ error: "E-mail is niet geconfigureerd op de server" });
  }

  const category = body.planName?.trim() || "Onbekend";
  const fullName = `${firstName} ${lastName}`;
  const parentName = [body.parentFirstName?.trim(), body.parentLastName?.trim()].filter(Boolean).join(" ");
  const experienceText = body.experience?.trim() || "Niet ingevuld";

  const rows: MailRow[] = [
    ["Voornaam", firstName],
    ["Naam", lastName],
    ["Geboortedatum", formatDate(body.birthDate)],
    ["Leeftijd", `${age} jaar`],
    ["E-mail (antwoord hierop)", replyEmail],
  ];

  if (parentName) {
    rows.push(["Ouder / voogd", parentName]);
  }

  try {
    await mail.transporter.sendMail({
      from: `"Fit Ham Website" <${mail.user}>`,
      to: mail.to,
      replyTo: replyEmail,
      subject: `Inschrijvingsaanvraag: ${category} - ${fullName} (${age} jaar)`,
      text: buildMailText({
        heading: `INSCHRIJVINGSAANVRAAG - ${category.toUpperCase()}`,
        rowsTitle: "Gegevens speler",
        rows,
        bodyTitle: "Eerdere volleybalervaring",
        body: experienceText,
      }),
      html: buildMailHtml({
        eyebrow: "Inschrijvingsaanvraag",
        title: category,
        subtitle: `${escapeHtml(fullName)} &bull; ${age} jaar`,
        rowsTitle: "Gegevens speler",
        rows,
        bodyTitle: "Eerdere volleybalervaring",
        body: experienceText,
      }),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Registration mail error:", error);
    return res.status(500).json({ error: "Versturen mislukt, probeer het later opnieuw" });
  }
}

/** Geboortedatum zoals we die in de mail tonen: 04/09/2011. */
function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit", year: "numeric" });
}
