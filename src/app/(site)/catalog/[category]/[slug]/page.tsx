import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import AddToCartButton from "@/components/cart/AddToCartButton";
import Breadcrumbs, { type Crumb } from "@/components/catalog/Breadcrumbs";
import ProductCard from "@/components/catalog/ProductCard";
import ProductGallery from "@/components/catalog/ProductGallery";
import JsonLd from "@/components/JsonLd";
import {
  getAllCategories,
  getAllProductPaths,
  getProduct,
  getRelatedProducts,
} from "@/lib/data";
import { formatPrice, paragraphs } from "@/lib/format";
import { site } from "@/lib/site";

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateStaticParams() {
  const paths = await getAllProductPaths();
  return paths.map((p) => ({ category: p.categorySlug, slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const path = `/catalog/${product.categorySlug}/${product.slug}`;
  const title = product.seoTitle ?? `${product.title} — купить`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    `${product.title}. Цена, характеристики, доставка по Казахстану.`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "MektepMebel.kz",
      locale: "ru_RU",
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { category: categorySlug, slug } = await params;

  const product = await getProduct(slug);
  if (!product) notFound();

  // у товара один правильный адрес
  if (product.categorySlug !== categorySlug) {
    permanentRedirect(`/catalog/${product.categorySlug}/${product.slug}`);
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
    name: product.title,
    description: product.shortDescription || undefined,
    image: images.length > 0 ? images : undefined,
    category: category?.title,
    url,
    ...(product.price != null && {
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "KZT",
        price: product.price,
        availability: product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: site.name },
      },
    }),
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <Breadcrumbs items={crumbs} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
          <ProductGallery images={images} alt={product.title} />

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
                    / шт (с НДС)
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
                }}
              />
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-school-blue hover:bg-blue-800 text-white font-bold px-6 py-3.5 rounded-xl shadow transition text-sm flex items-center justify-center gap-2"
              >
                <i className="fa-brands fa-whatsapp text-lg" /> Написать в WhatsApp
              </a>
            </div>
          </div>
        </div>

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