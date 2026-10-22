import type { NextApiRequest, NextApiResponse } from "next";
import { calculateAge } from "@/lib/age";
import {
  checkTurnstile,
  cleanField,
  FIELD_LIMITS,
  isSameOriginRequest,
  isValidEmail,
} from "@/lib/formGuard";
import { buildMailHtml, buildMailText, escapeHtml, getMailConfig, type MailRow } from "@/lib/mail";

// Ontvangt een inschrijving vanaf de lidmaatschapspagina
// (sections/membership/RegistrationModal) en mailt een overzichtje naar de club,
// zodat het bestuur meteen ziet wie lid wil worden, hoe oud die is en welke
// ervaring die heeft. De opmaak van de mail zit in lib/mail, de spamcontroles in
// lib/formGuard.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isSameOriginRequest(req)) {
    return res.status(403).json({ error: "Ongeldige aanvraag" });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  const captchaError = await checkTurnstile(req, body.turnstileToken);
  if (captchaError) {
    return res.status(captchaError.status).json({ error: captchaError.error });
  }

  const firstName = cleanField(body.playerFirstName, FIELD_LIMITS.name);
  const lastName = cleanField(body.playerLastName, FIELD_LIMITS.name);
  const replyEmail = cleanField(body.email, FIELD_LIMITS.email);
  const birthDate = cleanField(body.birthDate, FIELD_LIMITS.short);

  if (!firstName || !lastName || !birthDate || !replyEmail) {
    return res.status(400).json({ error: "Vul alle verplichte velden in" });
  }

  if (!isValidEmail(replyEmail)) {
    return res.status(400).json({ error: "Vul een geldig e-mailadres in" });
  }

  const age = calculateAge(birthDate);
  if (age === null) {
    return res.status(400).json({ error: "Geboortedatum is ongeldig" });
  }

  const mail = getMailConfig();
  if (!mail) {
    return res.status(500).json({ error: "E-mail is niet geconfigureerd op de server" });
  }

  const category = cleanField(body.planName, FIELD_LIMITS.short) || "Onbekend";
  const fullName = `${firstName} ${lastName}`;
  const experienceText =
    cleanField(body.experience, FIELD_LIMITS.message, { multiline: true }) || "Niet ingevuld";

  const rows: MailRow[] = [
    ["Voornaam", firstName],
    ["Naam", lastName],
    ["Geboortedatum", formatDate(birthDate)],
    ["Leeftijd", `${age} jaar`],
    ["E-mail (antwoord hierop)", replyEmail],
  ];

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
