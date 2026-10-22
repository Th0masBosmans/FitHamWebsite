import type { NextApiRequest, NextApiResponse } from "next";

// Haalt de wedstrijdkalender van VolleyAdmin.
//
// Dit moet via de server: de browser mag die website niet rechtstreeks
// aanspreken. We halen de gegevens hier op en geven ze onbewerkt door;
// repository/volleyRepository leest ze uit en toont ze op de teampagina.
//
// Zonder stamnummer nemen we dat van Fit Ham zelf (L-0759).

const STAMNUMMER_PATTERN = /^[A-Z]{1,2}-\d{3,5}$/i;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { stamnummer } = req.query;
  const stam = (Array.isArray(stamnummer) ? stamnummer[0] : stamnummer) || "L-0759";

  if (!STAMNUMMER_PATTERN.test(stam)) {
    return res.status(400).json({ error: "Ongeldig stamnummer" });
  }

  try {
    const targetUrl = `https://www.volleyadmin2.be/services/wedstrijden_xml.php?stamnummer=${encodeURIComponent(stam)}`;
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: { "User-Agent": "FitHam/1.0" },
      // Niet eindeloos wachten als VolleyAdmin traag is.
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream error: ${response.status}` });
    }

    const xmlData = await response.text();

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("X-Content-Type-Options", "nosniff"); // security measure
    res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox"); // security measure
    // Vercel bewaart het antwoord 5 minuten, zodat niet elk bezoek VolleyAdmin aanspreekt.
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(xmlData);

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error fetching match data" });
  }
}
