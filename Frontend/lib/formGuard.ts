import type { NextApiRequest } from "next";

// Basisbescherming voor de publieke formulier-routes (/api/contact,
// /api/registration). Zonder deze controles kan iedereen met een script
// rechtstreeks naar de API posten, zonder de site ooit te openen. Dat is hoe de
// meeste spam binnenkomt: bots vinden de adressen in de JavaScript van de site.
//
// Dit houdt simpele scripts buiten. Een bot die een echte browser bestuurt komt
// hier nog door; daarvoor is een captcha (bv. Cloudflare Turnstile) nodig.

/**
 * Kijkt of de aanvraag echt van onze eigen site komt.
 *
 * Een browser stuurt bij een POST altijd een Origin-header mee met het adres van
 * de pagina waar het formulier staat. Die moet dus gelijk zijn aan het adres
 * waarop deze API draait (de Host-header). Zo werkt dit meteen op localhost, op
 * een preview-omgeving én op de echte site, zonder iets in .env te zetten.
 *
 * Scripts (curl, python, ...) laten die header meestal gewoon weg.
 */
export function isSameOriginRequest(req: NextApiRequest): boolean {
  const host = req.headers.host;
  if (!host) return false;

  // Referer als terugvalbasis: sommige oudere browsers sturen bij een fetch
  // vanaf dezelfde site enkel die header.
  const source = req.headers.origin || req.headers.referer;
  if (!source) return false;

  try {
    return new URL(source).host === host;
  } catch {
    // Geen geldig adres in de header: niet van ons.
    return false;
  }
}

/** Maximale lengte per soort veld, zodat niemand een mail van 10 MB kan versturen. */
export const FIELD_LIMITS = {
  email: 254,
  phone: 32,
  name: 80,
  message: 2000,
  /** Vrije keuzevelden zoals abonnement of ervaring. */
  short: 200,
} as const;

/**
 * Maakt een tekstveld klaar voor gebruik: haalt spaties weg aan de randen,
 * verwijdert regeleindes waar ze niet horen en kapt af op de maximumlengte.
 *
 * De regeleindes zijn belangrijk: die van een naam komen in de subject-regel van
 * de mail terecht, en daar kan een newline de mailheaders openbreken.
 */
export function cleanField(
  value: unknown,
  maxLength: number,
  options: { multiline?: boolean } = {}
): string {
  if (typeof value !== "string") return "";

  const withoutBreaks = options.multiline ? value : value.replace(/[\r\n]+/g, " ");
  return withoutBreaks.trim().slice(0, maxLength);
}

/** Simpele controle op de vorm van een e-mailadres (iets@iets.iets). */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

// ---------------------------------------------------------------------------
// Cloudflare Turnstile
// ---------------------------------------------------------------------------

/** Het adres van de bezoeker, achter een proxy staat het in x-forwarded-for. */
function getClientIp(req: NextApiRequest): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return first?.trim() || req.socket.remoteAddress || undefined;
}

/**
 * Controleert het Turnstile-bewijsje dat de browser meestuurt.
 *
 * De bezoeker krijgt in het formulier een onzichtbare controle van Cloudflare.
 * Slaagt die, dan geeft Cloudflare een eenmalig token. Hier vragen we aan
 * Cloudflare of dat token echt van hen komt. Zonder geldig token vertrekt er
 * geen mail, ook niet als iemand rechtstreeks naar de API post.
 *
 * Geeft `null` terug als alles in orde is, of een foutmelding voor de bezoeker.
 * Zo is het in een API-route twee regels:
 *
 *     const captchaError = await checkTurnstile(req, body.turnstileToken);
 *     if (captchaError) return res.status(captchaError.status).json({ error: captchaError.error });
 *
 * Staat TURNSTILE_SECRET_KEY niet in .env, dan slaan we de controle over tijdens
 * het ontwikkelen (anders kan je lokaal niets testen), maar weigeren we de mail
 * op de echte site. Liever een foutmelding dan stilzwijgend onbeschermd staan.
 */
export async function checkTurnstile(
  req: NextApiRequest,
  token: unknown
): Promise<{ status: number; error: string } | null> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return { status: 500, error: "Beveiliging is niet geconfigureerd op de server" };
    }
    console.warn("[formGuard] TURNSTILE_SECRET_KEY ontbreekt, controle overgeslagen (development)");
    return null;
  }

  if (typeof token !== "string" || !token) {
    return { status: 400, error: "Bevestig even dat je geen robot bent" };
  }

  const body = new URLSearchParams({ secret, response: token });
  const ip = getClientIp(req);
  if (ip) body.set("remoteip", ip);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      // Niet eindeloos wachten als Cloudflare traag is.
      signal: AbortSignal.timeout(5000),
    });
    const result = (await response.json()) as { success?: boolean; "error-codes"?: string[] };

    if (!result.success) {
      console.warn("[formGuard] Turnstile afgekeurd:", result["error-codes"]);
      // Het token is eenmalig; de bezoeker moet het opnieuw proberen.
      return { status: 400, error: "Verificatie verlopen, probeer het opnieuw" };
    }

    return null;
  } catch (error) {
    // Cloudflare onbereikbaar. We laten de mail dan niet door: anders is de
    // bescherming weg op precies het moment dat iemand ze zou omzeilen.
    console.error("[formGuard] Turnstile onbereikbaar:", error);
    return { status: 503, error: "Verificatie lukt even niet, probeer het later opnieuw" };
  }
}
