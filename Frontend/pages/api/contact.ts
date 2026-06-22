import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

// Receives the contact form submission and emails it to the club inbox.
// Uses Gmail SMTP; credentials live in env vars so they stay server-side.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = (req.body ?? {}) as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!email || !message) {
    return res.status(400).json({ error: "E-mail en bericht zijn verplicht" });
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO || user;

  if (!user || !pass) {
    return res.status(500).json({ error: "E-mail is niet geconfigureerd op de server" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `"Fit Ham Website" <${user}>`,
      to,
      replyTo: email,
      subject: `Nieuw contactbericht van ${name?.trim() || email}`,
      text: `Naam: ${name?.trim() || "-"}\nE-mail: ${email}\n\nBericht:\n${message}`,
      html: `
        <h2>Nieuw contactbericht</h2>
        <p><strong>Naam:</strong> ${escapeHtml(name?.trim() || "-")}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Bericht:</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact mail error:", error);
    return res.status(500).json({ error: "Versturen mislukt, probeer het later opnieuw" });
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
