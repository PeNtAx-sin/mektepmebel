import { client } from "@/sanity/lib/client";

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
  inStock: boolean;
  shortDescription: string;
  image: string | null;
  gallery: string[];
  description: string | null;
  specs: Spec[];
  seoTitle: string | null;
  seoDescription: string | null;
  badge?: string; // зарезервировано, сейчас не используется
};

/* ---------- служебное ---------- */

const REVALIDATE_SECONDS = 60; // изменения из Studio появляются на сайте до минуты

async function fetchGroq<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return client.fetch<T>(query, params, { next: { revalidate: REVALIDATE_SECONDS } });
}

/** Ссылка на картинку Sanity с нужной шириной и современным форматом */
export function sanityImage(url: string, width?: number): string;
export function sanityImage(url: string | null | undefined, width?: number): string | null;
export function sanityImage(url: string | null | undefined, width = 900) {
  return url ? `${url}?w=${width}&auto=format&q=80` : null;
}

/* ---------- категории ---------- */

export async function getAllCategories(): Promise<Category[]> {
  const rows = await fetchGroq<Category[]>(`
    *[_type == "category" && defined(slug.current)]
      | order(coalesce(sortOrder, 999) asc, title asc) {
      "id": _id,
      "slug": slug.current,
      title,
      "description": coalesce(shortDescription, ""),
      "image": image.asset->url,
      "parentSlug": parent->slug.current,
      intro,
      bottomText,
      "faq": coalesce(faq, []),
      seoTitle,
      seoDescription
    }
  `);
  return rows.map((c) => ({ ...c, image: sanityImage(c.image, 800) }));
}

/** Основные категории (для главной) */
export async function getCategories(): Promise<Category[]> {
  const all = await getAllCategories();
  return all.filter((c) => !c.parentSlug);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getAllCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

/* ---------- товары ---------- */

type RawProduct = Omit<Product, "image" | "gallery"> & {
  image: string | null;
  gallery: string[];
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
  price,
  "inStock": coalesce(inStock, true),
  "shortDescription": coalesce(shortDescription, ""),
  "image": image.asset->url,
  "gallery": coalesce(gallery[].asset->url, []),
  description,
  "specs": coalesce(specs, []),
  seoTitle,
  seoDescription
}`;

function mapProduct(p: RawProduct): Product {
  return {
    ...p,
    image: sanityImage(p.image, 900),
    gallery: p.gallery.map((url) => sanityImage(url, 1200)),
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

export async function getProductsCount(): Promise<number> {
  return fetchGroq<number>(`count(*[_type == "product" && defined(slug.current)])`);
}

/** Пары «категория + товар» для генерации страниц и sitemap */
export async function getAllProductPaths(): Promise<
  { categorySlug: string; slug: string }[]
> {
  const products = await getProducts();
  return products.map((p) => ({ categorySlug: p.categorySlug, slug: p.slug }));
}