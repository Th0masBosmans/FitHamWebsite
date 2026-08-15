import type { NextApiRequest, NextApiResponse } from "next";

// Hetzelfde verhaal als proxy-matches, maar dan voor de rangschikking van een
// reeks. Ook dit moet via de server omdat de browser VolleyAdmin niet
// rechtstreeks mag aanspreken. De tabel op de teampagina komt hiervandaan.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { stamnummer, reeks } = req.query;

  if (!reeks) {
    return res.status(400).json({ error: "Missing required parameter: reeks" });
  }

  const stam = (Array.isArray(stamnummer) ? stamnummer[0] : stamnummer) || "L-0759";
  const r = Array.isArray(reeks) ? reeks[0] : reeks;

  try {
    const targetUrl = `https://www.volleyadmin2.be/services/rangschikking_xml.php?stamnummer=${stam}&reeks=${r}`;
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
    console.error("[Proxy] rangschikking error:", error);
    res.status(500).json({ error: "Internal Server Error fetching rangschikking data" });
  }
}
