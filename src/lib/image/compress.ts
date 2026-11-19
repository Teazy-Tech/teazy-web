/**
 * Phone-side photo compression before upload. Teachers photograph scripts on
 * mid-range Android phones (often 4–12 MB per photo) over prepaid data, so
 * images are resized to at most `maxDimension` px on the long edge and
 * re-encoded as JPEG. PDFs and other non-image files pass through unchanged.
 */
export interface CompressOptions {
  maxDimension?: number;
  /** JPEG quality, 0–1. */
  quality?: number;
  /** Images already smaller than this are left as they are. */
  skipBelowBytes?: number;
}

const DEFAULTS: Required<CompressOptions> = {
  maxDimension: 1600,
  quality: 0.8,
  skipBelowBytes: 300 * 1024,
};

/** Target size that keeps the aspect ratio and fits within maxDimension. */
export function fitWithin(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function canCompressInThisBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof createImageBitmap === "function" &&
    typeof document !== "undefined"
  );
}

export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const { maxDimension, quality, skipBelowBytes } = { ...DEFAULTS, ...options };
  const compressible =
    file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp";
  if (!compressible || file.size < skipBelowBytes || !canCompressInThisBrowser()) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { width, height } = fitWithin(bitmap.width, bitmap.height, maxDimension);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff"; // transparent PNG areas become white, not black
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.(png|webp|jpe?g)$/i, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified });
  } catch {
    // Unsupported format (e.g. some HEIC files) or out of memory: upload the original.
    return file;
  }
}

/**
 * Runs `worker` over `items` with at most `limit` running at once, keeping the
 * input order. Weak phones choke when a dozen photos decode in parallel.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(Math.max(1, limit), items.length) }, run));
  return results;
}
