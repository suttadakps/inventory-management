/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the workspace DB package (ships TypeScript source).
  transpilePackages: ["@artiverges/database"],
  // Prisma must run in the Node.js runtime, not be bundled.
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: {
    // Default is 1MB; estimation-upload accepts files up to 4MB.
    serverActions: { bodySizeLimit: "5mb" },
  },
  async redirects() {
    return [
      // The internal back-office subdomain shares this deployment with the
      // public marketing site. Resolved as an edge routing rule (not in the
      // page component) so the marketing homepage stays fully static and
      // cacheable — see git history for why a headers()-based check in the
      // page component was reverted (it forced dynamic rendering sitewide).
      {
        source: "/",
        has: [{ type: "host", value: "management.artivergesnext.com" }],
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
