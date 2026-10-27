import type { Metadata } from "next";
import { site } from "@/lib/site";

// Шаблон заголовка в layout добавляет « | Mektep Mebel» (15 символов),
// поисковики показывают ~60 — на саму страницу остаётся 45.
export const TITLE_MAX = 45;
export const DESCRIPTION_MAX = 160;

/** Обрезает текст по границе слова, чтобы он влез в лимит сниппета */
export function clampText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:—-]+$/, "")}…`;
}

/** Первый вариант заголовка, который влезает в лимит; иначе — первый, обрезанный */
export function fitTitle(...variants: (string | null | undefined)[]): string {
  const list = variants.filter((v): v is string => Boolean(v?.trim())).map((v) => v.trim());
  return list.find((v) => v.length <= TITLE_MAX) ?? clampText(list[0] ?? site.name, TITLE_MAX);
}

/**
 * Метаданные страницы: title, description, canonical, OpenGraph и Twitter.
 * Без `image` — общая картинка из opengraph-image.tsx.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  absoluteTitle = false,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article";
  absoluteTitle?: boolean;
  noindex?: boolean;
}): Metadata {
  const desc = clampText(description, DESCRIPTION_MAX);
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  // свой openGraph страницы отменяет картинку из opengraph-image.tsx — подставляем её явно
  const images = image
    ? [{ url: image, width: 1200, height: 1200, alt: imageAlt ?? title }]
    : [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.name }];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: site.name,
      locale: "ru_RU",
      title: fullTitle,
      description: desc,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: images.map((i) => i.url),
    },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}

/** Абсолютный адрес страницы сайта */
export const absoluteUrl = (path: string) => `${site.url}${path === "/" ? "" : path}`;
