import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs, { type Crumb } from "@/components/catalog/Breadcrumbs";
import CatalogSidebar from "@/components/catalog/CatalogSidebar";
import ProductGrid from "@/components/catalog/ProductGrid";
import JsonLd from "@/components/JsonLd";
import {
  getAllCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/data";
import { paragraphs } from "@/lib/format";

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

  return {
    title: category.seoTitle ?? `${category.title} — купить в Казахстане`,
    description:
      category.seoDescription ??
      `${category.title}: цены, характеристики и доставка по Казахстану. Запросите смету.`,
    alternates: { canonical: `/catalog/${slug}` },
    // пустые категории не показываем в поиске
    robots: products.length === 0 ? { index: false, follow: true } : undefined,
  };
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
  const faq = category.faq.filter((f) => f.question && f.answer);

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
              {category.intro &&
                paragraphs(category.intro).map((text, i) => (
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

            {category.bottomText && (
              <section className="mt-10 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 text-sm text-slate-600 leading-relaxed">
                {paragraphs(category.bottomText).map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </section>
            )}

            {faq.length > 0 && (
              <section className="mt-10 space-y-3">
                <h2 className="text-2xl font-black text-slate-900">Частые вопросы</h2>
                {faq.map((f, i) => (
                  <details
                    key={i}
                    className="group bg-white border border-slate-200 rounded-2xl p-5"
                  >
                    <summary className="cursor-pointer font-semibold text-slate-900 text-sm list-none flex items-center justify-between gap-4">
                      {f.question}
                      <i className="fa-solid fa-chevron-down text-xs text-slate-400 transition group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      {f.answer}
                    </p>
                  </details>
                ))}
                <JsonLd
                  data={{
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    mainEntity: faq.map((f) => ({
                      "@type": "Question",
                      name: f.question,
                      acceptedAnswer: { "@type": "Answer", text: f.answer },
                    })),
                  }}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}