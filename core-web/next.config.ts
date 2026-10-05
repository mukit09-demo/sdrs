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

  /**
   * The market and service sets were both reshaped — fourteen sectors to ten,
   * and thirteen services to ten — with most of the survivors renamed. These are
   * the paths that used to be prerendered, pointed at whatever now covers them:
   * permanent, because the old URLs are in search results and in client decks.
   * Retire an entry only once nothing links to it.
   */
  async redirects() {
    const markets: Record<string, string> = {
      property: "buildings",
      sport: "buildings",
      education: "buildings",
      "arts-and-culture": "buildings",
      cities: "cities-and-communities",
      "international-development": "cities-and-communities",
      transport: "transport-and-mobility",
      water: "water-and-environment",
      "industry-and-manufacturing": "industrial-and-manufacturing",
      resources: "industrial-and-manufacturing",
      healthcare: "healthcare-and-science",
      science: "healthcare-and-science",
      "data-centres": "data-centers-and-digital-infrastructure",
    };

    const services: Record<string, string> = {
      "building-services-engineering": "building-services-mep",
      "fire-engineering": "building-services-mep",
      acoustics: "architecture-and-integrated-building-design",
      geotechnics: "geotechnical-and-foundation-engineering",
      masterplanning: "civil-and-infrastructure-engineering",
      "transport-planning": "civil-and-infrastructure-engineering",
      "sustainability-consulting": "sustainability-and-resilience",
      "climate-resilience": "sustainability-and-resilience",
      "digital-consulting": "digital-engineering-and-bim",
      "programme-management": "project-and-construction-advisory",
      "advisory-economics": "project-and-construction-advisory",
      "research-and-innovation": "research-innovation-and-training",
    };

    return [
      ...Object.entries(markets).map(([from, to]) => ({
        source: `/markets/${from}`,
        destination: `/markets/${to}`,
        permanent: true,
      })),
      ...Object.entries(services).map(([from, to]) => ({
        source: `/services/${from}`,
        destination: `/services/${to}`,
        permanent: true,
      })),
    ];
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
