import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { isAdminRequest } from "@/lib/requireAdmin";

// Returns a short-lived signature for a Cloudinary upload. Signing happens here so the
// API secret stays server-side; the browser uploads directly to Cloudinary with the result.
// Admin-only: an open signing endpoint would let anyone upload to our Cloudinary account.
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
