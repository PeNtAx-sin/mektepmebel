import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import ProductGrid from "@/components/catalog/ProductGrid";
import JsonLd from "@/components/JsonLd";
import OpenTenderButton from "@/components/OpenTenderButton";
import FaqSection from "@/components/seo/FaqSection";
import RelatedLinks from "@/components/seo/RelatedLinks";
import { getProducts } from "@/lib/data";
import { priceFromLabel } from "@/lib/format";
import { getLandingPage, landingHref, landingPages } from "@/lib/landing-pages";
import { itemListSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return landingPages.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return {};
  const products = (await getProducts()).filter(page.products);
  return pageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: landingHref(slug),
    image: products.find((p) => p.image)?.image,
    noindex: products.length === 0,
  });
}

// Посадочная страница под группу запросов: тексты в lib/landing-pages.ts, товары из каталога
export default async function LandingPageRoute({ params }: Props) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();

  const products = (await getProducts()).filter(page.products);
  const path = landingHref(slug);
  const priceFrom = priceFromLabel(products);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <Breadcrumbs
          items={[
            { name: "Главная", href: "/" },
            { name: "Каталог", href: "/catalog" },
            { name: page.title, href: path },
          ]}
        />

        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 mb-6 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{page.title}</h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{page.intro}</p>
          {priceFrom && <p className="text-sm font-bold text-slate-900">{priceFrom}</p>}
          <OpenTenderButton className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition">
            <i className="fa-solid fa-calculator" /> Рассчитать стоимость
          </OpenTenderButton>
        </div>

        <ProductGrid products={products} />
        {products.length > 0 && <JsonLd data={itemListSchema(page.title, path, products)} />}

        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {page.sections.map((s) => (
            <div key={s.title} className="bg-white p-6 rounded-3xl border border-slate-200">
              <h2 className="text-lg font-black text-slate-900 mb-2">{s.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </section>

        <FaqSection faq={page.faq} />
        <RelatedLinks links={[...page.related, { title: "Весь каталог", href: "/catalog" }]} />
      </div>
    </div>
  );
}
