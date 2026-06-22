import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { isAdminRequest } from "@/lib/requireAdmin";

// Deletes an image from Cloudinary. Runs server-side so the API secret is never
// exposed to the browser. Cloudinary's destroy endpoint requires a SHA-1 signature
// over the request params concatenated with the API secret.
// Admin-only: an open endpoint would let anyone delete any asset by public_id.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!(await isAdminRequest(req))) {
    return res.status(401).json({ error: "Niet geautoriseerd" });
  }

  const { publicId } = req.body as { publicId?: string };
  if (!publicId) {
    return res.status(400).json({ error: "publicId is verplicht" });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: "Cloudinary is niet geconfigureerd" });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature,
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: "POST", body }
  );

  const result = (await response.json()) as { result?: string };

  // Cloudinary returns 200 with { result: "not found" } when the asset is already gone,
  // which we treat as success so a missing image doesn't block deleting the DB row.
  if (!response.ok || (result.result !== "ok" && result.result !== "not found")) {
    return res.status(502).json({ error: "Verwijderen uit Cloudinary mislukt", detail: result });
  }

  return res.status(200).json({ result: "ok" });
}
