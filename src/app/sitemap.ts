import type { MetadataRoute } from "next";
import {
  categorySlugsFor,
  getAllCategories,
  getArticles,
  getHomeCafeChairs,
  getProducts,
  HOME_CAFE_MENU_ITEM,
} from "@/lib/data";
import { landingHref, landingPages } from "@/lib/landing-pages";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600; // карта обновляется раз в час

const latest = (dates: string[]) =>
  dates.length > 0 ? new Date(dates.reduce((a, b) => (a > b ? a : b))) : undefined;

// Карта сайта из Sanity: категории с товарами, товары (с фото), статьи
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, articles, homeCafe] = await Promise.all([
    getAllCategories(),
    getProducts(),
    getArticles(),
    getHomeCafeChairs(),
  ]);

  const productDates = products.map((p) => p.updatedAt);
  // товар подкатегории обновляет и дату родительской категории (и общего раздела)
  const inCategory = (slug: string) => {
    const slugs = categorySlugsFor(slug, categories);
    return products.filter((p) => slugs.includes(p.categorySlug));
  };

  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: latest(productDates), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/catalog"), lastModified: latest(productDates), changeFrequency: "weekly", priority: 0.9 },
  ];

  for (const c of categories) {
    const items = inCategory(c.slug);
    if (items.length === 0) continue; // пустые категории закрыты от индексации
    entries.push({
      url: absoluteUrl(`/catalog/${c.slug}`),
      lastModified: latest(items.map((p) => p.updatedAt)),
      changeFrequency: "weekly",
      priority: c.parentSlug ? 0.7 : 0.8,
    });
  }

  if (homeCafe.length > 0) {
    entries.push({
      url: absoluteUrl(HOME_CAFE_MENU_ITEM.href),
      lastModified: latest(homeCafe.map((p) => p.updatedAt)),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const l of landingPages) {
    const items = products.filter(l.products);
    if (items.length === 0) continue;
    entries.push({
      url: absoluteUrl(landingHref(l.slug)),
      lastModified: latest(items.map((p) => p.updatedAt)),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const p of products) {
    entries.push({
      url: absoluteUrl(`/catalog/${p.categorySlug}/${p.slug}`),
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly",
      priority: 0.6,
      images: [p.image, ...p.gallery].filter((u): u is string => Boolean(u)),
    });
  }

  if (articles.length > 0) {
    entries.push({
      url: absoluteUrl("/blog"),
      lastModified: latest(articles.map((a) => a.updatedAt)),
      changeFrequency: "weekly",
      priority: 0.6,
    });
    for (const a of articles) {
      entries.push({
        url: absoluteUrl(`/blog/${a.slug}`),
        lastModified: new Date(a.updatedAt),
        changeFrequency: "monthly",
        priority: 0.5,
        ...(a.cover && { images: [a.cover] }),
      });
    }
  }

  return entries;
}
