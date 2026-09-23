// Next's image optimizer refuses private/loopback hosts, so photos served by
// the local Supabase stack are passed through as-is in development; hosted
// Storage URLs get resized and converted to AVIF/WebP.
export function canOptimize(url: string): boolean {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}
