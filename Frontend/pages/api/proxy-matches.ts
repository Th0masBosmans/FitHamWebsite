import type { NextApiRequest, NextApiResponse } from "next";

// Server-side proxy to VolleyAdmin's match calendar XML (no CORS on the browser).
// Only used in development; in production the client fetches via a public CORS
// proxy instead (see volleyRepository).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { stamnummer } = req.query;
  const stam = (Array.isArray(stamnummer) ? stamnummer[0] : stamnummer) || "L-0759";

  try {
    const targetUrl = `https://www.volleyadmin2.be/services/wedstrijden_xml.php?stamnummer=${stam}`;
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: { "User-Agent": "FitHam/1.0" },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream error: ${response.status}` });
    }

    const xmlData = await response.text();
    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xmlData);
  } catch (error) {
    console.error("[Proxy] matches error:", error);
    res.status(500).json({ error: "Internal Server Error fetching match data" });
  }
}
