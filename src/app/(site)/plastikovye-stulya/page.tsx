import type { Metadata } from "next";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import ProductGrid from "@/components/catalog/ProductGrid";
import JsonLd from "@/components/JsonLd";
import OpenTenderButton from "@/components/OpenTenderButton";
import FaqSection from "@/components/seo/FaqSection";
import RelatedLinks from "@/components/seo/RelatedLinks";
import { getHomeCafeChairs, HOME_CAFE_MENU_ITEM } from "@/lib/data";
import { itemListSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { homeCafeSeo } from "@/lib/seo-content";

const PATH = HOME_CAFE_MENU_ITEM.href;

export async function generateMetadata(): Promise<Metadata> {
  const chairs = await getHomeCafeChairs();
  return pageMetadata({
    title: homeCafeSeo.seoTitle,
    description: homeCafeSeo.seoDescription,
    path: PATH,
    image: chairs.find((c) => c.image)?.image,
    noindex: chairs.length === 0,
  });
}

// Посадочная страница под запросы «пластиковые стулья для дома / кафе / офиса»:
// те же товары, что в каталоге, но с текстом под эти запросы
export default async function HomeCafeChairsPage() {
  const chairs = await getHomeCafeChairs();

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <Breadcrumbs
          items={[
            { name: "Главная", href: "/" },
            { name: "Каталог", href: "/catalog" },
            { name: homeCafeSeo.title, href: PATH },
          ]}
        />

        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 mb-6 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{homeCafeSeo.title}</h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{homeCafeSeo.intro}</p>
          <OpenTenderButton className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition">
            <i className="fa-solid fa-calculator" /> Рассчитать стоимость
          </OpenTenderButton>
        </div>

        <ProductGrid products={chairs} />
        {chairs.length > 0 && <JsonLd data={itemListSchema(homeCafeSeo.title, PATH, chairs)} />}

        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {homeCafeSeo.sections.map((s) => (
            <div key={s.title} className="bg-white p-6 rounded-3xl border border-slate-200">
              <h2 className="text-lg font-black text-slate-900 mb-2">{s.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </section>

        <FaqSection faq={homeCafeSeo.faq} />
        <RelatedLinks
          links={[
            { title: "Школьные стулья", href: "/catalog/stulya" },
            { title: "Школьные парты", href: "/catalog/party" },
            { title: "Весь каталог", href: "/catalog" },
          ]}
        />
      </div>
    </div>
  );
}
