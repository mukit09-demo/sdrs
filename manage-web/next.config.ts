import { resolve } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Workspace app importing `@sdrs/shared` from outside its own directory, so
   * tracing has to start at the repo root.
   */
  outputFileTracingRoot: resolve(import.meta.dirname, ".."),

  /** Same reasoning as core-web: hrefs are plain strings from the content layer. */
  typedRoutes: false,

  async rewrites() {
    const apiOrigin = process.env.BACKEND_ORIGIN;
    if (!apiOrigin) return [];

    // Lets the CMS call /api/* on its own origin while Spring Boot runs
    // elsewhere in development — no CORS configuration needed.
    return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }];
  },
};

export default nextConfig;
