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
};

export default nextConfig;
