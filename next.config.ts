import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  staticPageGenerationTimeout: 180,
  // The quiz became the Games section.
  async redirects() {
    return [
      { source: "/quiz", destination: "/games", permanent: true },
      { source: "/timeline", destination: "/decades", permanent: true },
      // Colours is a filter on the covers page now; the query string carries over.
      { source: "/colors", destination: "/covers", permanent: true },
    ];
  },
  // The share images read these font files at runtime.
  outputFileTracingIncludes: {
    "/**": ["./assets/fonts/**"],
  },
};

export default nextConfig;
