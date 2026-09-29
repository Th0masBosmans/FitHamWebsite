import type { NextApiRequest, NextApiResponse } from "next";
import {
  checkTurnstile,
  cleanField,
  FIELD_LIMITS,
  isSameOriginRequest,
  isValidEmail,
} from "@/lib/formGuard";
import { buildMailHtml, buildMailText, getMailConfig, type MailRow } from "@/lib/mail";
import { BoardMemberRepository } from "@/repository/boardMemberRepository";

const boardMemberRepository = new BoardMemberRepository();

// Ontvangt het formulier op /onze-club/api (sections/onze-club/IntegrityForm) en
// mailt het naar het Aanspreekpunt Integriteit. Het adres halen we hier op de
// server uit het bestuur, zodat niemand het vanuit de browser kan omleiden.
//
// Naam en e-mail zijn optioneel. Laat de melder ze leeg, dan blijft het bericht
// anoniem: geen reply-to en we loggen niets over de afzender.
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

  const name = cleanField(body.name, FIELD_LIMITS.name);
  const email = cleanField(body.email, FIELD_LIMITS.email);
  const message = cleanField(body.message, FIELD_LIMITS.message, { multiline: true });
  if (!message) {
    return res.status(400).json({ error: "Vul een bericht in" });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: "Vul een geldig e-mailadres in, of laat het veld leeg" });
  }

  const mail = getMailConfig();
  if (!mail) {
    return res.status(500).json({ error: "E-mail is niet geconfigureerd op de server" });
  }

  const to = await boardMemberRepository.fetchIntegrityOfficerEmail();
  if (!to) {
    return res.status(500).json({ error: "Er is momenteel geen API ingesteld, probeer het later opnieuw" });
  }

  const isAnonymous = !name && !email;
  const rows: MailRow[] = [
    ["Naam", name || "Niet ingevuld"],
    ["E-mail", email || "Niet ingevuld"],
    ["Verstuurd via", "Formulier op /onze-club/api"],
  ];
  const title = isAnonymous ? "Nieuw anoniem bericht" : `Nieuw bericht van ${name || email}`;

  try {
    await mail.transporter.sendMail({
      from: `"Fit Ham Website" <${mail.user}>`,
      to,
      // Met een e-mailadres kan de API gewoon op de mail antwoorden.
      replyTo: email || undefined,
      subject: `${title} voor de API`,
      text: buildMailText({
        heading: `${title.toUpperCase()} VOOR DE API`,
        rowsTitle: "Gegevens",
        rows,
        bodyTitle: "Bericht",
        body: message,
      }),
      html: buildMailHtml({
        eyebrow: "Aanspreekpunt Integriteit",
        title,
        rowsTitle: "Gegevens",
        rows,
        bodyTitle: "Bericht",
        body: message,
      }),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Integrity mail error:", error);
    return res.status(500).json({ error: "Versturen mislukt, probeer het later opnieuw" });
  }
}
