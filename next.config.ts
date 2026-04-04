import type { NextConfig } from "next";
import buildBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = buildBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default withBundleAnalyzer(nextConfig);
