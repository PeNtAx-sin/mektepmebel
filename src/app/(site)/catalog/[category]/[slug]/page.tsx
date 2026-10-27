import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import AddToCartButton from "@/components/cart/AddToCartButton";
import Breadcrumbs, { type Crumb } from "@/components/catalog/Breadcrumbs";
import ProductCard from "@/components/catalog/ProductCard";
import ProductGallery from "@/components/catalog/ProductGallery";
import JsonLd from "@/components/JsonLd";
import RelatedLinks from "@/components/seo/RelatedLinks";
import OpenTenderButton from "@/components/OpenTenderButton";
import {
  getAllCategories,
  getAllProductPaths,
  getProduct,
  getRelatedProducts,
  HOME_CAFE_MENU_ITEM,
} from "@/lib/data";
import { formatPrice, paragraphs, vatLabel } from "@/lib/format";
import { imageObject, ORGANIZATION_ID } from "@/lib/schema";
import { fitTitle, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ category: string; slug: string }> };

/** Next передаёт slug из адреса закодированным (пробел — %20) */
function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

// старые адреса со случайным пробелом в slug находят исправленный товар
async function findProduct(slug: string) {
  return (await getProduct(slug)) ?? (await getProduct(slug.trim()));
}

export async function generateStaticParams() {
  const paths = await getAllProductPaths();
  return paths.map((p) => ({ category: p.categorySlug, slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await findProduct(decodeSlug(slug));
  if (!product) return {};

  const price =
    product.price != null
      ? `Цена ${formatPrice(product.price)} (${vatLabel(product.vatIncluded)}).`
      : "Цена по запросу.";
  const usage = isHomeCafeChair(product) ? " Подходит для школы, дома, кафе и офиса." : "";

  return pageMetadata({
    title: fitTitle(product.seoTitle, `${product.title} — купить`, product.title),
    description:
      product.seoDescription ||
      `${product.title}. ${price}${usage} ${product.shortDescription || "Характеристики и фото на сайте."} Доставка по Казахстану.`,
    path: `/catalog/${product.categorySlug}/${product.slug}`,
    image: product.image,
    imageAlt: product.imageAlt,
  });
}

/** Стул, который продаём и для дома / кафе: отмечен в Studio или любой стул, кроме кресла */
function isHomeCafeChair(product: { forHomeCafe: boolean; categorySlug: string; title: string }) {
  return product.forHomeCafe || (product.categorySlug === "stulya" && !/кресл/i.test(product.title));
}

export default async function ProductPage({ params }: Props) {
  const { category: categorySlug, slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);

  const product = await findProduct(slug);
  if (!product) notFound();

  // у товара один правильный адрес
  if (product.categorySlug !== categorySlug || product.slug !== slug) {
    permanentRedirect(`/catalog/${product.categorySlug}/${encodeURIComponent(product.slug)}`);
  }

  const [categories, related] = await Promise.all([
    getAllCategories(),
    getRelatedProducts(product.categorySlug, product.slug),
  ]);

  const category = categories.find((c) => c.slug === product.categorySlug);
  const parent = category?.parentSlug
    ? categories.find((c) => c.slug === category.parentSlug)
    : undefined;

  const path = `/catalog/${product.categorySlug}/${product.slug}`;
  const url = `${site.url}${path}`;
  const images = [product.image, ...product.gallery].filter((u): u is string =>
    Boolean(u),
  );
  const specs = product.specs.filter((s) => s.label && s.value);

  const crumbs: Crumb[] = [
    { name: "Главная", href: "/" },
    { name: "Каталог", href: "/catalog" },
    ...(parent ? [{ name: parent.title, href: `/catalog/${parent.slug}` }] : []),
    ...(category ? [{ name: category.title, href: `/catalog/${category.slug}` }] : []),
    { name: product.title, href: path },
  ];

  const waText = `Здравствуйте! Интересует: ${product.title}\n${url}`;
  const waHref = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(waText)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    description: product.shortDescription || product.description || undefined,
    image: images.length > 0 ? images.map((src) => imageObject(src, product.imageAlt)) : undefined,
    category: category?.title,
    url,
    ...(product.price != null && {
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "KZT",
        price: product.price,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: product.price,
          priceCurrency: "KZT",
          valueAddedTaxIncluded: product.vatIncluded,
        },
        availability: product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": ORGANIZATION_ID },
      },
    }),
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <Breadcrumbs items={crumbs} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
          <ProductGallery images={images} alt={product.imageAlt} />

          <div className="space-y-6">
            <div>
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 ${
                  product.inStock
                    ? "bg-brand-50 text-brand-600"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {product.inStock ? "В наличии" : "Под заказ"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {product.title}
              </h1>
              {category && (
                <Link
                  href={`/catalog/${category.slug}`}
                  className="text-xs text-school-blue hover:underline mt-2 inline-block"
                >
                  Все товары категории «{category.title}»
                </Link>
              )}
            </div>

            <div className="text-3xl font-black text-slate-900">
              {product.price != null ? (
                <>
                  {formatPrice(product.price)}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    / шт ({vatLabel(product.vatIncluded)})
                  </span>
                </>
              ) : (
                "Цена по запросу"
              )}
            </div>

            {product.shortDescription && (
              <p className="text-slate-600 text-sm leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <AddToCartButton
                item={{
                  id: product.id,
                  slug: product.slug,
                  categorySlug: product.categorySlug,
                  title: product.title,
                  price: product.price,
                  vatIncluded: product.vatIncluded,
                }}
              />
              <a
                href={waHref}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="bg-school-blue hover:bg-blue-800 text-white font-bold px-6 py-3.5 rounded-xl shadow transition text-sm flex items-center justify-center gap-2"
              >
                <i className="fa-brands fa-whatsapp text-lg" /> Написать в WhatsApp
              </a>
            </div>
          </div>
        </div>

        {!product.description && specs.length === 0 && (
          <section className="mt-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Размеры, материалы и ростовые группы уточните у менеджера — подготовим
              спецификацию и коммерческое предложение.
            </p>
            <OpenTenderButton className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-3 rounded-xl text-sm transition">
              Запросить характеристики
            </OpenTenderButton>
          </section>
        )}

        {(product.description || specs.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {product.description && (
              <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-3">
                <h2 className="text-xl font-black text-slate-900">Описание</h2>
                {paragraphs(product.description).map((text, i) => (
                  <p key={i} className="text-sm text-slate-600 leading-relaxed">
                    {text}
                  </p>
                ))}
              </section>
            )}

            {specs.length > 0 && (
              <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200">
                <h2 className="text-xl font-black text-slate-900 mb-4">
                  Характеристики
                </h2>
                <dl className="text-sm divide-y divide-slate-100">
                  {specs.map((s, i) => (
                    <div key={i} className="flex justify-between gap-6 py-2.5">
                      <dt className="text-slate-500">{s.label}</dt>
                      <dd className="font-medium text-slate-900 text-right">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        )}

        <RelatedLinks
          links={[
            ...(category ? [{ title: `${category.title}: все модели`, href: `/catalog/${category.slug}` }] : []),
            ...(parent ? [{ title: parent.title, href: `/catalog/${parent.slug}` }] : []),
            ...(isHomeCafeChair(product) ? [HOME_CAFE_MENU_ITEM] : []),
            { title: "Весь каталог", href: "/catalog" },
          ]}
        />

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Похожие товары</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <JsonLd data={jsonLd} />
    </div>
  );
}