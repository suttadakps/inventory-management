/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the workspace DB package (ships TypeScript source).
  transpilePackages: ["@artiverges/database"],
  // Prisma must run in the Node.js runtime, not be bundled.
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
