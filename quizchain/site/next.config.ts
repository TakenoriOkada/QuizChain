import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/QuizChain",
  assetPrefix: "/QuizChain/",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;




