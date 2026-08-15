import { encode } from "@jsquash/jpeg";

// Verkleint foto's in de browser vóór ze geüpload worden. Zo blijven de uploads
// snel en blijven we onder de maximumgrootte van Cloudinary. Wordt gebruikt door
// repository/cloudinaryRepository (alle foto's) en repository/albumRepository
// (albumfoto's). Video's gaan er niet door: die kan de browser niet omzetten.

type CompressOptions = {
  /** JPEG-kwaliteit, 0-100. Lager = kleiner bestand, maar korreliger. */
  quality?: number;
  /** Schaalt de foto terug zodat de langste zijde hoogstens zoveel pixels is. */
  maxDimension?: number;
}

export async function fileToImageData(file: File, maxDimension?: number): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);

  let width = bitmap.width;
  let height = bitmap.height;
  if (maxDimension && Math.max(width, height) > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return ctx.getImageData(0, 0, width, height);
}

export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const { quality = 35, maxDimension } = options;
  const imageData = await fileToImageData(file, maxDimension);
  const compressed = await encode(imageData, { quality });
  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([compressed], name, { type: "image/jpeg" });
}
