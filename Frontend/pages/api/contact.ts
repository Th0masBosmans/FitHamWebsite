import type { NextApiRequest, NextApiResponse } from "next";
import { buildMailHtml, buildMailText, getMailConfig, type MailRow } from "@/lib/mail";

// Ontvangt het contactformulier (sections/contact/ContactForm) en mailt het naar
// de club. De opmaak van de mail zelf zit in lib/mail.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, phoneNumber, firstName, lastName, message } = (req.body ?? {}) as {
    email?: string;
    phoneNumber?: string;
    firstName?: string;
    lastName?: string;
    message?: string;
  };

  if (!email || !phoneNumber || !message) {
    return res.status(400).json({ error: "E-mail, telefoonnummer en bericht zijn verplicht" });
  }

  const mail = getMailConfig();
  if (!mail) {
    return res.status(500).json({ error: "E-mail is niet geconfigureerd op de server" });
  }

  const fullName = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  const title = fullName || email;

  const rows: MailRow[] = [
    ["E-mail", email],
    ["Telefoonnummer", phoneNumber],
    ["Voornaam", firstName?.trim() || "-"],
    ["Naam", lastName?.trim() || "-"],
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
