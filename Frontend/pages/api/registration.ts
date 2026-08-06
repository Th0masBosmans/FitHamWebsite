import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

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

// Receives an inschrijving from the membership page and emails a structured
// summary to the club inbox, so the board can immediately see who wants to join,
// how old they are and welke ervaring ze hebben. Same Gmail SMTP setup as /api/contact.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    planName,
    playerFirstName,
    playerLastName,
    birthDate,
    email,
    experience,
    parentFirstName,
    parentLastName,
    parentEmail,
  } = (req.body ?? {}) as RegistrationBody;

  const firstName = playerFirstName?.trim();
  const lastName = playerLastName?.trim();
  const replyEmail = (parentEmail || email)?.trim();

  if (!firstName || !lastName || !birthDate || !replyEmail) {
    return res.status(400).json({ error: "Vul alle verplichte velden in" });
  }

  const age = calculateAge(birthDate);

  if (age === null) {
    return res.status(400).json({ error: "Geboortedatum is ongeldig" });
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

  const category = planName?.trim() || "Onbekend";
  const fullName = `${firstName} ${lastName}`;
  const parentName = [parentFirstName?.trim(), parentLastName?.trim()].filter(Boolean).join(" ");
  const experienceText = experience?.trim() || "Niet ingevuld";

  const rows: Array<[string, string]> = [
    ["Voornaam", firstName],
    ["Naam", lastName],
    ["Geboortedatum", formatDate(birthDate)],
    ["Leeftijd", `${age} jaar`],
    ["E-mail (antwoord hierop)", replyEmail],
  ];

  if (parentName) {
    rows.push(["Ouder / voogd", parentName]);
  }

  try {
    await transporter.sendMail({
      from: `"Fit Ham Website" <${user}>`,
      to,
      replyTo: replyEmail,
      subject: `Inschrijvingsaanvraag: ${category} - ${fullName} (${age} jaar)`,
      text: [
        `INSCHRIJVINGSAANVRAAG - ${category.toUpperCase()}`,
        "",
        "Gegevens speler",
        ...rows.map(([label, value]) => `${label}: ${value}`),
        "",
        "Eerdere volleybalervaring",
        experienceText,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#002d6b;max-width:600px">
          <div style="background:#004aad;color:#ffffff;padding:20px 24px;border-radius:12px 12px 0 0">
            <p style="margin:0;font-size:13px;letter-spacing:1px;text-transform:uppercase;opacity:.85">Inschrijvingsaanvraag</p>
            <h1 style="margin:6px 0 0;font-size:24px">${escapeHtml(category)}</h1>
            <p style="margin:8px 0 0;font-size:15px">${escapeHtml(fullName)} &bull; ${age} jaar</p>
          </div>

          <div style="border:1px solid #e3e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">
            <h2 style="margin:0 0 12px;font-size:16px;color:#004aad">Gegevens speler</h2>
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

            <h2 style="margin:24px 0 8px;font-size:16px;color:#004aad">Eerdere volleybalervaring</h2>
            <p style="margin:0;font-size:14px;white-space:pre-wrap;background:#f5f8fc;border-radius:8px;padding:12px">${escapeHtml(
              experienceText
            )}</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Registration mail error:", error);
    return res.status(500).json({ error: "Versturen mislukt, probeer het later opnieuw" });
  }
}

/** Age in whole years on the day of submission, or null for an invalid/future date. */
function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 && age < 120 ? age : null;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
