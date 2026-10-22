/**
 * Laat alleen gewone links door: webadressen (http/https), mail, telefoon en
 * paden binnen onze eigen site ("/membership"). Een link zoals
 * "javascript:..." voert code uit bij een klik; die geven we nooit door.
 *
 * Gebruikt voor alle links die in het beheerpaneel ingetypt worden (sponsors,
 * inschrijfknoppen, knoppen in nieuwsberichten). Geeft undefined terug bij een
 * ongeldige link, dan doet de knop gewoon niets.
 */
export function safeHref(url: string | null | undefined): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  // Eén schuine streep is een pad op onze site; twee ("//iets.com") is een andere site.
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  return undefined;
}
