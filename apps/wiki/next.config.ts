import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);

// configure runtime to edge for cloudflare pages
export const runtime = "edge";
if (process.env.NODE_ENV === "development") {
  setupDevPlatform();
}
