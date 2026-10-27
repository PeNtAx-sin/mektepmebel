import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import type { SanityImageObject } from "@sanity/image-url/lib/types/types";
import type { MenuItem } from "@/lib/site";

export type Spec = { label: string; value: string };
export type Faq = { question: string; answer: string };

export type Category = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string | null;
  parentSlug: string | null;
  intro: string | null;
  bottomText: string | null;
  faq: Faq[];
  seoTitle: string | null;
  seoDescription: string | null;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  price: number | null; // null = цена по запросу
  vatIncluded: boolean; // price — с НДС (поле price) или без (поле priceVat)
  inStock: boolean;
  shortDescription: string;
  image: string | null;
  imageAlt: string; // подпись к фото, по умолчанию название товара
  gallery: string[];
  description: string | null;
  specs: Spec[];
  seoTitle: string | null;
  seoDescription: string | null;
};

/* ---------- служебное ---------- */

const REVALIDATE_SECONDS = 60; // изменения из Studio появляются на сайте до минуты

async function fetchGroq<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return client.fetch<T>(query, params, { next: { revalidate: REVALIDATE_SECONDS } });
}

type SanityImage = Partial<SanityImageObject> | null;

// картинка вместе с кадрированием из Studio
const IMAGE_FIELDS = `{ asset, crop, hotspot }`;

/** Адрес картинки Sanity с учётом кадрирования; ширину и формат добавляет imageLoader */
function imageUrl(image: SanityImage | undefined): string | null {
  return image?.asset ? urlFor(image as SanityImageObject).url() : null;
}

/* ---------- категории ---------- */

export async function getAllCategories(): Promise<Category[]> {
  const rows = await fetchGroq<(Omit<Category, "image"> & { image: SanityImage })[]>(`
    *[_type == "category" && defined(slug.current)]
      | order(coalesce(sortOrder, 999) asc, title asc) {
      "id": _id,
      "slug": slug.current,
      title,
      "description": coalesce(shortDescription, ""),
      "image": image${IMAGE_FIELDS},
      "parentSlug": parent->slug.current,
      intro,
      bottomText,
      "faq": coalesce(faq, []),
      seoTitle,
      seoDescription
    }
  `);
  return rows.map((c) => ({ ...c, image: imageUrl(c.image) }));
}

/** Основные категории (для главной) */
export async function getCategories(): Promise<Category[]> {
  const all = await getAllCategories();
  return all.filter((c) => !c.parentSlug);
}

/** Меню каталога для шапки и подвала: основные категории с подкатегориями */
export async function getCatalogMenu(): Promise<MenuItem[]> {
  const all = await getAllCategories();
  return all
    .filter((c) => !c.parentSlug)
    .map((c) => ({
      title: c.title,
      href: `/catalog/${c.slug}`,
      children: all
        .filter((child) => child.parentSlug === c.slug)
        .map((child) => ({ title: child.title, href: `/catalog/${child.slug}` })),
    }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getAllCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

/* ---------- товары ---------- */

type RawProduct = Omit<Product, "image" | "imageAlt" | "gallery"> & {
  image: SanityImage;
  imageAlt: string | null;
  gallery: SanityImage[];
};

const PRODUCT_BASE = `*[_type == "product" && defined(slug.current)]`;
const PRODUCT_ORDER = `| order(coalesce(sortOrder, 999) asc, _createdAt desc)`;

// Пока у товара не выбрана новая «Категория», берём старое поле category
const PRODUCT_PROJECTION = `{
  "id": _id,
  "slug": slug.current,
  title,
  "categorySlug": coalesce(
    categoryRef->slug.current,
    select(
      category == "parta" => "party",
      category == "chair" => "stulya",
      category == "spec" => "kabinety"
    )
  ),
  // «Цена с НДС», если заполнена, иначе «Цена без НДС»
  "price": coalesce(price, priceVat),
  "vatIncluded": defined(price) || !defined(priceVat),
  "inStock": coalesce(inStock, true),
  "shortDescription": coalesce(shortDescription, ""),
  "image": image${IMAGE_FIELDS},
  "imageAlt": image.alt,
  "gallery": coalesce(gallery[defined(asset)]${IMAGE_FIELDS}, []),
  description,
  "specs": coalesce(specs, []),
  seoTitle,
  seoDescription
}`;

function mapProduct(p: RawProduct): Product {
  return {
    ...p,
    title: p.title.trim(),
    image: imageUrl(p.image),
    imageAlt: p.imageAlt?.trim() || p.title.trim(),
    gallery: p.gallery.map(imageUrl).filter((url): url is string => url !== null),
  };
}

export async function getProducts(): Promise<Product[]> {
  const rows = await fetchGroq<RawProduct[]>(
    `${PRODUCT_BASE} ${PRODUCT_ORDER} ${PRODUCT_PROJECTION}[defined(categorySlug)]`,
  );
  return rows.map(mapProduct);
}

/** Товары категории вместе с товарами её подкатегорий */
export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const all = await getAllCategories();
  const slugs = [slug, ...all.filter((c) => c.parentSlug === slug).map((c) => c.slug)];
  const rows = await fetchGroq<RawProduct[]>(
    `${PRODUCT_BASE} ${PRODUCT_ORDER} ${PRODUCT_PROJECTION}[defined(categorySlug) && categorySlug in $slugs]`,
    { slugs },
  );
  return rows.map(mapProduct);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const row = await fetchGroq<RawProduct | null>(
    `*[_type == "product" && slug.current == $slug] ${PRODUCT_PROJECTION}[defined(categorySlug)][0]`,
    { slug },
  );
  return row ? mapProduct(row) : null;
}

export async function getRelatedProducts(
  categorySlug: string,
  excludeSlug: string,
): Promise<Product[]> {
  const rows = await fetchGroq<RawProduct[]>(
    `${PRODUCT_BASE} ${PRODUCT_ORDER} ${PRODUCT_PROJECTION}[categorySlug == $categorySlug && slug != $excludeSlug][0...4]`,
    { categorySlug, excludeSlug },
  );
  return rows.map(mapProduct);
}

/** Товар для большой карточки на главной: отмеченный «featured», иначе первый */
export async function getFeaturedProduct(): Promise<Product | null> {
  const row = await fetchGroq<RawProduct | null>(
    `*[_type == "product" && defined(slug.current) && featured == true] ${PRODUCT_ORDER} ${PRODUCT_PROJECTION}[defined(categorySlug)][0]`,
  );
  if (row) return mapProduct(row);
  const all = await getProducts();
  return all[0] ?? null;
}

/** Сколько товаров в каталоге: те же условия, что в getProducts() */
export async function getProductsCount(): Promise<number> {
  return fetchGroq<number>(
    `count(${PRODUCT_BASE} ${PRODUCT_PROJECTION}[defined(categorySlug)])`,
  );
}

/** Пары «категория + товар» для генерации страниц и sitemap */
export async function getAllProductPaths(): Promise<
  { categorySlug: string; slug: string }[]
> {
  const products = await getProducts();
  return products.map((p) => ({ categorySlug: p.categorySlug, slug: p.slug }));
}
/* ---------- проекты ---------- */

export type HeroSlide = {
  src: string;
  alt: string;
  title: string;
  location: string | null;
  isVisualization: boolean;
  position: string; // object-position из точки Hotspot в Studio
};

const MAX_HERO_SLIDES = 12;

type Crop = { top: number; bottom: number; left: number; right: number };
type Hotspot = { x: number; y: number };

/** Точка Hotspot как CSS object-position — в координатах уже обрезанного (crop) фото */
function hotspotPosition(image: SanityImage): string {
  const hotspot = image?.hotspot as Hotspot | undefined;
  if (!hotspot) return "50% 50%";
  const crop = (image?.crop as Crop | undefined) ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const toPercent = (value: number, start: number, end: number) =>
    Math.round(Math.min(1, Math.max(0, (value - start) / (1 - start - end))) * 100);
  return `${toPercent(hotspot.x, crop.left, crop.right)}% ${toPercent(hotspot.y, crop.top, crop.bottom)}%`;
}

/** Фото проектов для слайдера на первом экране главной */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  const projects = await fetchGroq<
    {
      title: string;
      location: string | null;
      isVisualization: boolean | null;
      photos: (SanityImage & { alt?: string })[] | null;
    }[]
  >(`
    *[_type == "project" && showOnHome != false && count(photos) > 0]
      | order(coalesce(sortOrder, 999) asc, _createdAt desc) {
      title,
      location,
      isVisualization,
      "photos": photos[defined(asset)]{ asset, crop, hotspot, alt }
    }
  `);

  return projects
    .flatMap((p) =>
      (p.photos ?? []).map((photo) => {
        return {
          src: imageUrl(photo),
          alt: photo?.alt?.trim() || p.title,
          title: p.title,
          location: p.location,
          isVisualization: Boolean(p.isVisualization),
          position: hotspotPosition(photo),
        };
      }),
    )
    .filter((s): s is HeroSlide => s.src !== null)
    .slice(0, MAX_HERO_SLIDES);
}
