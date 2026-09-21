import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root instead of relying on Next's ancestor-directory
  // auto-detection, which otherwise picks up an unrelated package-lock.json
  // sitting in this machine's home directory.
  turbopack: {
    root: __dirname,
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
