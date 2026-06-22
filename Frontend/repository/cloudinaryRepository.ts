import { compressImage } from "@/lib/imageCompression";
import { supabase } from "@/supabase";

// Attaches the current admin's Supabase access token so the signing/delete
// endpoints can verify the request server-side (see lib/requireAdmin).
async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

class CloudinaryRepository {
    async uploadToCloudinary(file: File, maxSizeKb = 50): Promise<string> {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        if (!cloudName) throw new Error("Cloudinary cloud name ontbreekt");

        const maxBytes = maxSizeKb * 1024;
        const fileToUpload = file.size > maxBytes ? await compressImage(file) : file;
        if (fileToUpload.size > maxBytes) throw new Error(`Afbeelding is te groot, maximale grootte is ${maxSizeKb} KB`);

        const signResponse = await fetch("/api/cloudinary/sign-upload", {
            method: "POST",
            headers: await authHeader(),
        });
        if (!signResponse.ok) throw new Error("Kon de upload niet ondertekenen");

        const { apiKey, timestamp, signature } = (await signResponse.json()) as {
            apiKey: string;
            timestamp: number;
            signature: string;
        };

        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);

        const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
    );

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

  getImageUrl(publicId: string): string {
    return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;
  }
}

export { CloudinaryRepository }