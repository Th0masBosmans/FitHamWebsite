import { encode } from "@jsquash/jpeg";

type CompressOptions = {
  /** JPEG quality 0-100. */
  quality?: number;
  /** If set, the image is scaled down so its longest side is at most this many pixels. */
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
