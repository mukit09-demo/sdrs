import { resolve } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * This app lives in a workspace, and it imports `@sdrs/shared` from outside its
   * own directory. Tracing has to start at the repo root or the shared package is
   * left out of the build output.
   */
  outputFileTracingRoot: resolve(import.meta.dirname, ".."),

  /**
   * Typed routes are disabled on purpose: card/nav hrefs come from the content
   * layer as plain strings (and will come from the Spring Boot API later), which
   * cannot satisfy the generated literal `Route` union without casts everywhere.
   */
  typedRoutes: false,

  images: {
    // Remote CMS/S3 hosts that will serve real imagery once the backend is live.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  async rewrites() {
    const apiOrigin = process.env.BACKEND_ORIGIN;
    if (!apiOrigin) return [];

    // Lets the browser call /api/* on the same origin while Spring Boot runs
    // elsewhere in development — no CORS configuration needed.
    return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }];
  },
};

export default nextConfig;
