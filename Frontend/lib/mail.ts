import nodemailer from "nodemailer";

// Alle mail van de site vertrekt hier. Zowel het contactformulier
// (/api/contact) als de inschrijving (/api/registration) gebruiken deze helpers,
// zodat de opmaak van beide mails identiek blijft.
//
// De inloggegevens staan in .env (SMTP_USER / SMTP_PASS / CONTACT_TO) en blijven
// dus op de server. Nooit in een component gebruiken.

/** Eén rij in het gegevens-tabelletje van de mail: [label, waarde]. */
export type MailRow = [string, string];

/**
 * Haalt de mailinstellingen uit .env. Geeft null terug als de server nog niet
 * geconfigureerd is, zodat de API-route een nette foutmelding kan tonen in
 * plaats van te crashen.
 */
export function getMailConfig() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  return {
    user,
    // Geen CONTACT_TO ingesteld? Dan sturen we naar het verzendadres zelf.
    to: process.env.CONTACT_TO || user,
    transporter: nodemailer.createTransport({ service: "gmail", auth: { user, pass } }),
  };
}

/** Maakt tekst veilig om in de HTML-mail te zetten (anders breekt < of & de opmaak). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Bouwt de platte-tekstversie van de mail, voor mailprogramma's die geen HTML
 * tonen. Elke mail heeft dezelfde opbouw: een titel, een blok met gegevens en
 * een blok met vrije tekst.
 */
export function buildMailText(options: {
  heading: string;
  rowsTitle: string;
  rows: MailRow[];
  bodyTitle: string;
  body: string;
}): string {
  return [
    options.heading,
    "",
    options.rowsTitle,
    ...options.rows.map(([label, value]) => `${label}: ${value}`),
    "",
    options.bodyTitle,
    options.body,
  ].join("\n");
}

/**
 * Bouwt de HTML-versie van de mail: een blauwe kop met titel, daaronder een
 * tabelletje met de gegevens en tot slot het bericht in een grijs kadertje.
 * De kleuren staan hier hard ingesteld omdat mailprogramma's geen CSS-variabelen
 * uit de website kennen.
 */
export function buildMailHtml(options: {
  /** Klein bovenschrift in de blauwe kop, bv. "Contactbericht". */
  eyebrow: string;
  /** Grote titel in de blauwe kop. */
  title: string;
  /** Optionele extra regel onder de titel, bv. "Jan Peeters • 14 jaar". Let op: wordt als
   *  HTML ingevoegd, dus zelf escapen (zie escapeHtml) als er invoer van de bezoeker in zit. */
  subtitle?: string;
  rowsTitle: string;
  rows: MailRow[];
  bodyTitle: string;
  body: string;
}): string {
  const subtitle = options.subtitle
    ? `<p style="margin:8px 0 0;font-size:15px">${options.subtitle}</p>`
    : "";

  const rows = options.rows
    .map(
      ([label, value]) => `
                <tr>
                  <td style="padding:6px 0;color:#5b6b85;width:45%">${escapeHtml(label)}</td>
                  <td style="padding:6px 0;font-weight:bold">${escapeHtml(value)}</td>
                </tr>`
    )
    .join("");

  return `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#002d6b;max-width:600px">
          <div style="background:#004aad;color:#ffffff;padding:20px 24px;border-radius:12px 12px 0 0">
            <p style="margin:0;font-size:13px;letter-spacing:1px;text-transform:uppercase;opacity:.85">${escapeHtml(options.eyebrow)}</p>
            <h1 style="margin:6px 0 0;font-size:24px">${escapeHtml(options.title)}</h1>
            ${subtitle}
          </div>

          <div style="border:1px solid #e3e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">
            <h2 style="margin:0 0 12px;font-size:16px;color:#004aad">${escapeHtml(options.rowsTitle)}</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
            </table>

            <h2 style="margin:24px 0 8px;font-size:16px;color:#004aad">${escapeHtml(options.bodyTitle)}</h2>
            <p style="margin:0;font-size:14px;white-space:pre-wrap;background:#f5f8fc;border-radius:8px;padding:12px">${escapeHtml(options.body)}</p>
          </div>
        </div>
      `;
}
