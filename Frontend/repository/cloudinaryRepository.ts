import { compressImage } from "@/lib/imageCompression";
import { supabase } from "@/supabase";

// Alles wat met foto's in Cloudinary te maken heeft. De andere repositories
// gebruiken dit bestand; zij bewaren in de database alleen het "public id" dat
// Cloudinary teruggeeft, niet de foto zelf.
//
// Uploaden verloopt in twee stappen: eerst vragen we via /api/cloudinary aan onze
// eigen server om toestemming, daarna sturen we de foto rechtstreeks naar
// Cloudinary. Zo hoeft het geheime wachtwoord nooit in de browser te staan.

// Stuurt het inlogbewijs van de beheerder mee, zodat onze eigen server kan
// nagaan of de aanvraag wel van een beheerder komt (zie lib/requireAdmin).
async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

class CloudinaryRepository {
  /**
   * Zet een foto in Cloudinary en geeft het "public id" terug dat in de database
   * bewaard wordt. Is de foto groter dan `maxSizeKb`, dan verkleinen we ze eerst
   * in de browser; lukt dat niet genoeg, dan weigeren we de upload.
   */
  async uploadToCloudinary(file: File, maxSizeKb = 50): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error("Cloudinary cloud name ontbreekt");

    const maxBytes = maxSizeKb * 1024;
    const fileToUpload = file.size > maxBytes ? await compressImage(file) : file;
    if (fileToUpload.size > maxBytes) {
      throw new Error(`Afbeelding is te groot, maximale grootte is ${maxSizeKb} KB`);
    }

    // Stap 1: toestemming vragen aan onze eigen server.
    const signResponse = await fetch("/api/cloudinary/sign-upload", {
      method: "POST",
      headers: await authHeader(),
    });
    if (!signResponse.ok) {
      // De reden van de server meegeven: anders is niet te zien of het om een
      // verlopen beheerderssessie (401) gaat of om ontbrekende Cloudinary-
      // sleutels op de server (500).
      const detail = (await signResponse.json().catch(() => null)) as { error?: string } | null;
      throw new Error(`Kon de upload niet ondertekenen (${signResponse.status}${detail?.error ? `: ${detail.error}` : ""})`);
    }

    const { apiKey, timestamp, signature } = (await signResponse.json()) as {
      apiKey: string;
      timestamp: number;
      signature: string;
    };

    // Stap 2: de foto zelf rechtstreeks naar Cloudinary sturen.
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const detail = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
      throw new Error(`Upload naar Cloudinary mislukt: ${detail?.error?.message ?? response.statusText}`);
    }

    return ((await response.json()) as { public_id: string }).public_id;
  }

  async deleteFromCloudinary(publicId: string): Promise<void> {
    const response = await fetch("/api/cloudinary/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) throw new Error("Verwijderen uit Cloudinary mislukt");
  }

  /**
   * Bouwt het webadres van een foto. `f_auto,q_auto` laat Cloudinary zelf het
   * beste formaat en de beste kwaliteit kiezen voor de browser van de bezoeker.
   */
  getImageUrl(publicId: string): string {
    return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;
  }
}

export { CloudinaryRepository }