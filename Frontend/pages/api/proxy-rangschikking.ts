import type { NextApiRequest, NextApiResponse } from "next";

// Hetzelfde verhaal als proxy-matches, maar dan voor de rangschikking van een
// reeks. Ook dit moet via de server omdat de browser VolleyAdmin niet
// rechtstreeks mag aanspreken. De tabel op de teampagina komt hiervandaan.

// headers die verhinderen dat het antwoord als code wordt uitgevoerd wordt.
const STAMNUMMER_PATTERN = /^[A-Z]{1,2}-\d{3,5}$/i;
const REEKS_PATTERN = /^[A-Z0-9-]{1,20}$/i;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { stamnummer, reeks } = req.query;

  if (!reeks) {
    return res.status(400).json({ error: "Missing required parameter: reeks" });
  }

  const stam = (Array.isArray(stamnummer) ? stamnummer[0] : stamnummer) || "L-0759";
  const r = Array.isArray(reeks) ? reeks[0] : reeks;

  if (!STAMNUMMER_PATTERN.test(stam) || !REEKS_PATTERN.test(r)) {
    return res.status(400).json({ error: "Ongeldig stamnummer of reeks" });
  }

  try {
    const targetUrl = `https://www.volleyadmin2.be/services/rangschikking_xml.php?stamnummer=${encodeURIComponent(stam)}&reeks=${encodeURIComponent(r)}`;
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: { "User-Agent": "FitHam/1.0" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream error: ${response.status}` });
    }

    const xmlData = await response.text();
    
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(xmlData);

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error fetching rangschikking data" });
  }
}
