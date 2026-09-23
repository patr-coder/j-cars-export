import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Not a full script CSP (Next's inline bootstrap scripts would need nonces
// on every request); these directives don't touch scripts and still block
// clickjacking, <base> hijacking, plugin content and off-site form posts.
const CONTENT_SECURITY_POLICY = [
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Pin the workspace root instead of relying on Next's ancestor-directory
  // auto-detection, which otherwise picks up an unrelated package-lock.json
  // sitting in this machine's home directory.
  turbopack: {
    root: __dirname,
  },
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Only public Storage objects of this project's own Supabase instance.
    remotePatterns: supabaseUrl ? [new URL("/storage/v1/object/public/**", supabaseUrl)] : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  experimental: {
    serverActions: {
      // Default is 1MB, well under a real photo (and under this project's
      // own 5MB-per-file / 10-files-per-upload limit in
      // uploadVehicleImages — see src/actions/vehicle-images.ts). Sized to
      // that limit's worst case (10 * 5MB) plus headroom, not left at the
      // framework default.
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
