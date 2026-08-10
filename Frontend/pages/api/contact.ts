import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

// Receives the contact form submission and emails it to the club inbox.
// Uses Gmail SMTP; credentials live in env vars so they stay server-side.
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

  const fullName = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");

  const rows: Array<[string, string]> = [
    ["E-mail", email],
    ["Telefoonnummer", phoneNumber],
    ["Voornaam", firstName?.trim() || "-"],
    ["Naam", lastName?.trim() || "-"],
  ];

  try {
    await transporter.sendMail({
      from: `"Fit Ham Website" <${user}>`,
      to,
      replyTo: email,
      subject: `Nieuw contactbericht van ${fullName || email}`,
      text: [
        "NIEUW CONTACTBERICHT",
        "",
        "Gegevens",
        ...rows.map(([label, value]) => `${label}: ${value}`),
        "",
        "Bericht",
        message,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#002d6b;max-width:600px">
          <div style="background:#004aad;color:#ffffff;padding:20px 24px;border-radius:12px 12px 0 0">
            <p style="margin:0;font-size:13px;letter-spacing:1px;text-transform:uppercase;opacity:.85">Contactbericht</p>
            <h1 style="margin:6px 0 0;font-size:24px">${escapeHtml(fullName || email)}</h1>
          </div>

          <div style="border:1px solid #e3e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">
            <h2 style="margin:0 0 12px;font-size:16px;color:#004aad">Gegevens</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              ${rows
                .map(
                  ([label, value]) => `
                <tr>
                  <td style="padding:6px 0;color:#5b6b85;width:45%">${escapeHtml(label)}</td>
                  <td style="padding:6px 0;font-weight:bold">${escapeHtml(value)}</td>
                </tr>`
                )
                .join("")}
            </table>

            <h2 style="margin:24px 0 8px;font-size:16px;color:#004aad">Bericht</h2>
            <p style="margin:0;font-size:14px;white-space:pre-wrap;background:#f5f8fc;border-radius:8px;padding:12px">${escapeHtml(
              message
            )}</p>
          </div>
        </div>
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
