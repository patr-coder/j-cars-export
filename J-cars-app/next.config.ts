import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root instead of relying on Next's ancestor-directory
  // auto-detection, which otherwise picks up an unrelated package-lock.json
  // sitting in this machine's home directory.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
