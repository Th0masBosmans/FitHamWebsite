import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { isAdminRequest } from "@/lib/requireAdmin";

// Geeft een kortlopend "toegangsbewijs" om een foto naar Cloudinary te mogen
// uploaden.
//
// Waarom deze omweg: het geheime Cloudinary-wachtwoord mag nooit in de browser
// terechtkomen. De browser vraagt hier dus eerst een handtekening op, en uploadt
// daarna zelf rechtstreeks naar Cloudinary. Alleen ingelogde beheerders krijgen
// er een, anders zou iedereen in onze Cloudinary kunnen uploaden.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!(await isAdminRequest(req))) {
    return res.status(401).json({ error: "Niet geautoriseerd" });
  }

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: "Cloudinary is niet geconfigureerd" });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return res.status(200).json({ apiKey, timestamp, signature });
}
