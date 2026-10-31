import type { PortableTextBlock } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import type { SanityImageObject } from "@sanity/image-url/lib/types/types";
import type { MenuItem } from "@/lib/site";
import { productDefaults } from "@/lib/product-specs";

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
  forHomeCafe: boolean; // показывать на странице «Пластиковые стулья для дома и кафе»
  updatedAt: string;
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
  const menu: MenuItem[] = all
    .filter((c) => !c.parentSlug)
    .map((c) => ({
      title: c.title,
      href: `/catalog/${c.slug}`,
      children: all
        .filter((child) => child.parentSlug === c.slug)
        .map((child) => ({ title: child.title, href: `/catalog/${child.slug}` })),
    }));
  return [...menu, HOME_CAFE_MENU_ITEM];
}

/** Отдельная страница под запросы «пластиковые стулья для дома / кафе» */
export const HOME_CAFE_MENU_ITEM: MenuItem = {
  title: "Пластиковые стулья для дома и кафе",
  href: "/plastikovye-stulya",
};

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getAllCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

export type CategoryCover = { src: string; alt: string; fromProduct: boolean };

/**
 * Картинка для карточек категорий: своя из Studio, а если её нет — фото первого
 * товара категории (вместе с подкатегориями). У пустой категории — фото первого
 * товара каталога, чтобы карточка не была пустой.
 */
export async function getCategoryCovers(): Promise<Map<string, CategoryCover>> {
  const [categories, products] = await Promise.all([getAllCategories(), getProducts()]);
  const withImage = products.filter((p) => p.image);
  const covers = new Map<string, CategoryCover>();
  const used = new Set<string>();
  const empty: typeof categories = [];
  for (const c of categories) {
    if (c.image) {
      covers.set(c.slug, { src: c.image, alt: c.title, fromProduct: false });
      continue;
    }
    const slugs = categorySlugsFor(c.slug, categories);
    // общему разделу — фото, которого ещё нет у входящих в него категорий
    const product = AGGREGATE_CATEGORIES[c.slug]
      ? undefined
      : withImage.find((p) => slugs.includes(p.categorySlug));
    if (!product?.image) {
      empty.push(c);
      continue;
    }
    used.add(product.image);
    covers.set(c.slug, { src: product.image, alt: `${c.title}: ${product.imageAlt}`, fromProduct: true });
  }
  // пустым категориям и общим разделам — фото, которого ещё нет на соседних карточках
  for (const c of empty) {
    const product = withImage.find((p) => !used.has(p.image!)) ?? withImage[0];
    if (!product?.image) continue;
    used.add(product.image);
    covers.set(c.slug, { src: product.image, alt: `${c.title}: ${product.imageAlt}`, fromProduct: true });
  }
  return covers;
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
  seoDescription,
  "forHomeCafe": coalesce(forHomeCafe, false),
  "updatedAt": _updatedAt
}`;

function mapProduct(p: RawProduct): Product {
  // пустые поля из Studio заполняем типовыми характеристиками модели
  const defaults = productDefaults(p);
  return {
    ...p,
    title: p.title.trim(),
    shortDescription: p.shortDescription.trim() || defaults?.shortDescription || "",
    description: p.description?.trim() || defaults?.description || null,
    specs: p.specs.some((s) => s.label && s.value) ? p.specs : (defaults?.specs ?? []),
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

/**
 * Общие разделы: показывают товары нескольких категорий сразу.
 * «Школьная мебель» собирает всё для школы; сами товары остаются в своих категориях.
 */
export const AGGREGATE_CATEGORIES: Record<string, string[]> = {
  "shkolnaya-mebel": ["party", "stulya", "party-dlya-himii-i-fiziki", "spec-mebel"],
};

/** Категории, чьи товары показываются на странице категории: она сама, подкатегории, а у общего раздела — его состав */
export function categorySlugsFor(slug: string, all: Category[]): string[] {
  const roots = [slug, ...(AGGREGATE_CATEGORIES[slug] ?? [])];
  return [...new Set([...roots, ...all.filter((c) => c.parentSlug && roots.includes(c.parentSlug)).map((c) => c.slug)])];
}

/** Товары категории вместе с товарами её подкатегорий (у общего раздела — всех входящих категорий) */
export type CatalogSection = { slug: string; title: string; products: Product[] };

/**
 * Разделы каталога — основные категории по порядку из Sanity; товары подкатегорий
 * идут в разделе родителя. Пустые разделы не показываем. only — ограничить список разделов.
 */
export function catalogSections(categories: Category[], products: Product[], only?: string[]): CatalogSection[] {
  const parentOf = new Map(categories.map((c) => [c.slug, c.parentSlug ?? c.slug]));
  return categories
    .filter((c) => !c.parentSlug && (!only || only.includes(c.slug)))
    .map((c) => ({
      slug: c.slug,
      title: c.title,
      products: products.filter((p) => parentOf.get(p.categorySlug) === c.slug),
    }))
    .filter((s) => s.products.length > 0);
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const all = await getAllCategories();
  const slugs = categorySlugsFor(slug, all);
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
/**
 * Стулья для страницы «Пластиковые стулья для дома, кафе и офиса»: отмеченные
 * в Studio галочкой «Подходит для дома и кафе». Пока ни один не отмечен —
 * все стулья из категории «Школьные стулья», кроме кресел.
 */
export async function getHomeCafeChairs(): Promise<Product[]> {
  const products = await getProducts();
  const marked = products.filter((p) => p.forHomeCafe);
  if (marked.length > 0) return marked;
  return products.filter((p) => p.categorySlug === "stulya" && !/кресл/i.test(p.title));
}

/* ---------- статьи ---------- */

export type ArticleCard = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string | null;
  coverAlt: string;
  publishedAt: string;
  updatedAt: string;
};

export type Article = ArticleCard & {
  body: PortableTextBlock[];
  seoTitle: string | null;
  seoDescription: string | null;
  categories: { title: string; href: string }[];
};

const ARTICLE_BASE = `*[_type == "article" && defined(slug.current) && defined(publishedAt)]`;
const ARTICLE_CARD = `
  "slug": slug.current,
  title,
  "excerpt": coalesce(excerpt, ""),
  "cover": cover${IMAGE_FIELDS},
  "coverAlt": coalesce(cover.alt, title),
  publishedAt,
  "updatedAt": _updatedAt`;

type RawArticleCard = Omit<ArticleCard, "cover"> & { cover: SanityImage };

export async function getArticles(): Promise<ArticleCard[]> {
  const rows = await fetchGroq<RawArticleCard[]>(`${ARTICLE_BASE} | order(publishedAt desc) { ${ARTICLE_CARD} }`);
  return rows.map((a) => ({ ...a, cover: imageUrl(a.cover) }));
}

export async function getArticle(slug: string): Promise<Article | null> {
  const row = await fetchGroq<(Omit<Article, "cover"> & { cover: SanityImage }) | null>(
    `${ARTICLE_BASE}[slug.current == $slug][0] {
      ${ARTICLE_CARD},
      "body": coalesce(body, []),
      seoTitle,
      seoDescription,
      "categories": coalesce(categories[]->{ title, "href": "/catalog/" + slug.current }, [])
    }`,
    { slug },
  );
  return row ? { ...row, cover: imageUrl(row.cover) } : null;
}

/* ---------- проекты ---------- */

export type ProjectPhoto = {
  src: string;
  alt: string;
  position: string; // object-position из точки Hotspot в Studio
};

export type Project = {
  id: string;
  title: string;
  location: string | null;
  isVisualization: boolean;
  photos: ProjectPhoto[];
  products: { title: string; href: string }[];
};

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

/** Готовые проекты для блока на главной */
export async function getProjects(): Promise<Project[]> {
  const rows = await fetchGroq<
    {
      id: string;
      title: string;
      location: string | null;
      isVisualization: boolean | null;
      photos: (SanityImage & { alt?: string })[] | null;
      products: (RawProduct | null)[] | null;
    }[]
  >(`
    *[_type == "project" && showOnHome != false && count(photos) > 0]
      | order(coalesce(sortOrder, 999) asc, _createdAt desc) {
      "id": _id,
      title,
      location,
      isVisualization,
      "photos": photos[defined(asset)]{ asset, crop, hotspot, alt },
      "products": products[]-> ${PRODUCT_PROJECTION}
    }
  `);

  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    location: p.location,
    isVisualization: Boolean(p.isVisualization),
    photos: (p.photos ?? [])
      .map((photo) => ({
        src: imageUrl(photo),
        alt: photo?.alt?.trim() || p.title,
        position: hotspotPosition(photo),
      }))
      .filter((photo): photo is ProjectPhoto => photo.src !== null),
    products: (p.products ?? [])
      .filter((r): r is RawProduct => Boolean(r?.categorySlug))
      .map((r) => ({ title: r.title.trim(), href: `/catalog/${r.categorySlug}/${r.slug}` })),
  }));
}

/* ---------- главная: 3D-кабинеты ---------- */

export type ShowcaseRoom = {
  key: string;
  label: string;
  image: { src: string; alt: string; width: number; height: number };
  pins: { key: string; label: string; x: number; y: number; href: string | null }[];
  projectId: string | null;
  categoryHref: string | null;
};

export type RoomShowcase = { title: string | null; rooms: ShowcaseRoom[] };

export async function getRoomShowcase(): Promise<RoomShowcase | null> {
  const row = await fetchGroq<{
    title: string | null;
    rooms:
      | {
          key: string;
          label: string | null;
          image: (SanityImage & { alt?: string }) | null;
          width: number | null;
          height: number | null;
          projectId: string | null;
          categorySlug: string | null;
          pins:
            | { key: string; label: string | null; x: number | null; y: number | null; product: RawProduct | null }[]
            | null;
        }[]
      | null;
  } | null>(`
    *[_id == "homePage"][0]{
      "title": coalesce(roomsTitle, "Наши проекты"),
      "rooms": rooms[]{
        "key": _key,
        label,
        "image": image{ asset, alt },
        "width": image.asset->metadata.dimensions.width,
        "height": image.asset->metadata.dimensions.height,
        "projectId": project._ref,
        "categorySlug": category->slug.current,
        "pins": pins[]{
          "key": _key,
          label,
          "x": position.x,
          "y": position.y,
          "product": product-> ${PRODUCT_PROJECTION}
        }
      }
    }
  `);

  const rooms = (row?.rooms ?? []).flatMap((room): ShowcaseRoom[] => {
    const src = imageUrl(room.image);
    if (!room.label || !src || !room.width || !room.height) return [];
    const label = room.label.trim();
    return [
      {
        key: room.key,
        label,
        image: {
          src,
          alt: room.image?.alt?.trim() || `3D-модель: ${label}`,
          width: room.width,
          height: room.height,
        },
        pins: (room.pins ?? [])
          .filter((pin) => pin.label && pin.x != null && pin.y != null)
          .map((pin) => ({
            key: pin.key,
            label: pin.label!.trim(),
            x: pin.x!,
            y: pin.y!,
            href: pin.product?.categorySlug
              ? `/catalog/${pin.product.categorySlug}/${pin.product.slug}`
              : null,
          })),
        projectId: room.projectId,
        categoryHref: room.categorySlug ? `/catalog/${room.categorySlug}` : null,
      },
    ];
  });

  return rooms.length > 0 ? { title: row?.title?.trim() || null, rooms } : null;
}
