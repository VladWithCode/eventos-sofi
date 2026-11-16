import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp, { type OutputInfo } from "sharp";
import type { MediaImage } from "@/lib/types";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-limits";

export const UPLOADS_DIR = join(process.cwd(), "data", "uploads");
export const MEDIA_FILE_PATTERN = /^[a-f0-9]{32}\.webp$/;

const MAX_EDGE = 2200;
// heif covers both AVIF and HEIC; HEIC decoding depends on the sharp build.
const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp", "heif"]);

export class MediaError extends Error {}

/**
 * Verifies, normalizes and stores an uploaded image as WebP. Throws MediaError
 * with a user-facing Spanish message when the file is not usable.
 */
export async function saveUploadedImage(file: File, alt: string): Promise<MediaImage> {
  if (file.size === 0) throw new MediaError("El archivo está vacío.");
  if (file.size > MAX_UPLOAD_BYTES) throw new MediaError("La imagen pesa más de 12 MB.");

  const input = Buffer.from(await file.arrayBuffer());
  let output: { data: Buffer; info: OutputInfo };
  let placeholder: Buffer;
  try {
    const meta = await sharp(input).metadata();
    if (!meta.format || !ACCEPTED_FORMATS.has(meta.format)) throw new MediaError("Formato de imagen no compatible.");

    output = await sharp(input, { failOn: "error" })
      .autoOrient()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    placeholder = await sharp(output.data).resize(16, 16, { fit: "inside" }).webp({ quality: 50 }).toBuffer();
  } catch (error) {
    if (error instanceof MediaError) throw error;
    throw new MediaError("No pudimos leer la imagen. Prueba con un JPG, PNG o WebP.");
  }

  const fileName = `${randomBytes(16).toString("hex")}.webp`;
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(join(UPLOADS_DIR, fileName), output.data, { flag: "wx" });

  return {
    url: `/media/${fileName}`,
    width: output.info.width,
    height: output.info.height,
    blurDataUrl: `data:image/webp;base64,${placeholder.toString("base64")}`,
    alt,
  };
}

/** Removes a stored upload. Ignores URLs that are not ours. */
export async function deleteStoredImage(image: Pick<MediaImage, "url"> | null | undefined) {
  const fileName = image?.url.startsWith("/media/") ? image.url.slice("/media/".length) : "";
  if (!MEDIA_FILE_PATTERN.test(fileName)) return;
  try {
    await rm(join(UPLOADS_DIR, fileName), { force: true });
  } catch (error) {
    console.error("[media] could not delete", fileName, error instanceof Error ? error.message : "");
  }
}
