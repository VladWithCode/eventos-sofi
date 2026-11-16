import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { MEDIA_FILE_PATTERN, UPLOADS_DIR } from "@/lib/media";

/** Serves uploaded images. File names are random and never reused, so they are cached forever. */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!MEDIA_FILE_PATTERN.test(file)) return new Response("Not found", { status: 404 });

  let data: Buffer;
  try {
    data = await readFile(join(UPLOADS_DIR, file));
  } catch {
    return new Response("Not found", { status: 404 });
  }
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(data.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
