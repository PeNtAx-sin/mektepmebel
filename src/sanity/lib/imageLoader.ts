import type { ImageLoaderProps } from "next/image";

/**
 * Загрузчик для next/image: картинки Sanity уменьшает и переводит в WebP/AVIF
 * сам CDN Sanity, поэтому оптимизатор Next не нужен. Остальные адреса
 * (файлы из public/) отдаём как есть.
 */
export default function sanityImageLoader({ src, width, quality }: ImageLoaderProps) {
  if (!src.startsWith("https://cdn.sanity.io/")) return src;

  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 80));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max"); // не увеличивать маленькие фото
  return url.toString();
}
