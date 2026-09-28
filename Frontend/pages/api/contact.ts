import type { NextApiRequest, NextApiResponse } from "next";
import {
  checkTurnstile,
  cleanField,
  FIELD_LIMITS,
  isSameOriginRequest,
  isValidEmail,
} from "@/lib/formGuard";
import { buildMailHtml, buildMailText, getMailConfig, type MailRow } from "@/lib/mail";

// Ontvangt het contactformulier (sections/contact/ContactForm) en mailt het naar
// de club. De opmaak van de mail zelf zit in lib/mail, de spamcontroles in
// lib/formGuard.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Alleen berichten die echt vanaf onze eigen site verstuurd zijn. Spambots
  // posten rechtstreeks naar dit adres en sturen die header niet mee.
  if (!isSameOriginRequest(req)) {
    return res.status(403).json({ error: "Ongeldige aanvraag" });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  // Bewijsje van Cloudflare dat er een mens achter zit.
  const captchaError = await checkTurnstile(req, body.turnstileToken);
  if (captchaError) {
    return res.status(captchaError.status).json({ error: captchaError.error });
  }

  const email = cleanField(body.email, FIELD_LIMITS.email);
  const phoneNumber = cleanField(body.phoneNumber, FIELD_LIMITS.phone);
  const firstName = cleanField(body.firstName, FIELD_LIMITS.name);
  const lastName = cleanField(body.lastName, FIELD_LIMITS.name);
  const message = cleanField(body.message, FIELD_LIMITS.message, { multiline: true });

  if (!email || !phoneNumber || !message) {
    return res.status(400).json({ error: "E-mail, telefoonnummer en bericht zijn verplicht" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Vul een geldig e-mailadres in" });
  }

  // Zelfde controle als in het formulier zelf, want die kan je omzeilen.
  if (phoneNumber.replace(/\D/g, "").length < 8) {
    return res.status(400).json({ error: "Vul een geldig telefoonnummer in" });
  }

  const mail = getMailConfig();
  if (!mail) {
    return res.status(500).json({ error: "E-mail is niet geconfigureerd op de server" });
  }

  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const title = fullName || email;

  const rows: MailRow[] = [
    ["E-mail", email],
    ["Telefoonnummer", phoneNumber],
    ["Voornaam", firstName || "-"],
    ["Naam", lastName || "-"],
  ];

  try {
    await mail.transporter.sendMail({
      from: `"Fit Ham Website" <${mail.user}>`,
      to: mail.to,
      // Zo kan het bestuur gewoon op de mail antwoorden om de bezoeker te bereiken.
      replyTo: email,
      subject: `Nieuw contactbericht van ${title}`,
      text: buildMailText({
        heading: "NIEUW CONTACTBERICHT",
        rowsTitle: "Gegevens",
        rows,
        bodyTitle: "Bericht",
        body: message,
      }),
      html: buildMailHtml({
        eyebrow: "Contactbericht",
        title,
        rowsTitle: "Gegevens",
        rows,
        bodyTitle: "Bericht",
        body: message,
      }),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact mail error:", error);
    return res.status(500).json({ error: "Versturen mislukt, probeer het later opnieuw" });
  }
}
