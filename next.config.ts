import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production builds from replacing the files used by a running local server.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
