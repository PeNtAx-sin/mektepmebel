import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // размеры и формат картинок Sanity готовит CDN Sanity, см. imageLoader.ts
    loader: "custom",
    loaderFile: "./src/sanity/lib/imageLoader.ts",
  },
  // старые адреса категорий после перестройки каталога (scripts/restructure-catalog.mjs)
  async redirects() {
    return [
      { source: "/catalog/kabinety", destination: "/catalog/party-dlya-himii-i-fiziki", permanent: true },
      { source: "/catalog/kabinety/:slug", destination: "/catalog/party-dlya-himii-i-fiziki/:slug", permanent: true },
      { source: "/catalog/komplekty", destination: "/catalog", permanent: true },
      { source: "/catalog/detskie-sady", destination: "/catalog", permanent: true },
    ];
  },
};


export default nextConfig;
