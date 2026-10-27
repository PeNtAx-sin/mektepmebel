import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs, { type Crumb } from "@/components/catalog/Breadcrumbs";
import CatalogSidebar from "@/components/catalog/CatalogSidebar";
import ProductGrid from "@/components/catalog/ProductGrid";
import JsonLd from "@/components/JsonLd";
import FaqSection from "@/components/seo/FaqSection";
import RelatedLinks from "@/components/seo/RelatedLinks";
import {
  getAllCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/data";
import { paragraphs } from "@/lib/format";
import { itemListSchema } from "@/lib/schema";
import { fitTitle, pageMetadata } from "@/lib/seo";
import { categorySeo } from "@/lib/seo-content";

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const products = await getProductsByCategory(slug);

  const defaults = categorySeo[slug];

  return pageMetadata({
    title: fitTitle(category.seoTitle, defaults?.seoTitle, `${category.title} — купить в Казахстане`, category.title),
    description:
      category.seoDescription ??
      defaults?.seoDescription ??
      `${category.title}: цены, характеристики и доставка по Казахстану. Запросите смету.`,
    path: `/catalog/${slug}`,
    image: category.image,
    // пустые категории не показываем в поиске
    noindex: products.length === 0,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const [categories, products] = await Promise.all([
    getAllCategories(),
    getProductsByCategory(slug),
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const parent = category.parentSlug
    ? categories.find((c) => c.slug === category.parentSlug)
    : undefined;
  const children = categories.filter((c) => c.parentSlug === slug);
  // тексты из Studio, а если поле пустое — по умолчанию из lib/seo-content.ts
  const defaults = categorySeo[slug];
  const intro = category.intro ?? defaults?.intro;
  const bottomText = category.bottomText ?? defaults?.bottomText;
  const faq = category.faq.some((f) => f.question && f.answer) ? category.faq : (defaults?.faq ?? []);
  const related = (defaults?.related ?? []).filter((l) => l.href !== `/catalog/${slug}`);

  const crumbs: Crumb[] = [
    { name: "Главная", href: "/" },
    { name: "Каталог", href: "/catalog" },
    ...(parent ? [{ name: parent.title, href: `/catalog/${parent.slug}` }] : []),
    { name: category.title, href: `/catalog/${slug}` },
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <Breadcrumbs items={crumbs} />

        <div className="flex flex-col lg:flex-row gap-8">
          <CatalogSidebar categories={categories} activeSlug={slug} />

          <div className="flex-grow min-w-0">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 mb-6 space-y-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {category.title}
              </h1>
              {intro &&
                paragraphs(intro).map((text, i) => (
                  <p key={i} className="text-sm text-slate-600 leading-relaxed">
                    {text}
                  </p>
                ))}
            </div>

            {children.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {children.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/catalog/${c.slug}`}
                    className="bg-white border border-slate-200 hover:border-school-blue hover:text-school-blue px-4 py-2 rounded-xl text-sm font-medium transition"
                  >
                    {c.title}
                  </Link>
                ))}
              </div>
            )}

            <ProductGrid products={products} />

            {products.length > 0 && <JsonLd data={itemListSchema(category.title, `/catalog/${slug}`, products)} />}

            {bottomText && (
              <section className="mt-10 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 text-sm text-slate-600 leading-relaxed">
                <h2 className="text-xl font-black text-slate-900">{category.title}: как выбрать</h2>
                {paragraphs(bottomText).map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </section>
            )}

            <FaqSection faq={faq} />
            <RelatedLinks links={related} />
          </div>
        </div>
      </div>
    </div>
  );
}