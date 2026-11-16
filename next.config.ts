import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Self-contained server bundle (.next/standalone): the VPS needs no dependency install.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Uploaded photos served by src/app/media/[file]/route.ts.
    localPatterns: [{ pathname: "/media/**", search: "" }],
  },
  experimental: {
    serverActions: {
      // Admin uploads send one image (max 12 MB) per request, plus multipart overhead.
      bodySizeLimit: "13mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
