import type { Metadata } from "next";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import ProductGrid from "@/components/catalog/ProductGrid";
import SearchForm from "@/components/catalog/SearchForm";
import { getAllCategories, getProducts } from "@/lib/data";
import { plural } from "@/lib/format";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

// Результаты поиска не индексируем (бесконечно много вариантов адреса),
// но ссылки на товары с этой страницы поисковик учитывает
export const metadata: Metadata = {
  title: "Поиск по каталогу",
  description: "Поиск школьной мебели и стульев по каталогу Mektep Mebel.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

const normalize = (s: string) => s.toLowerCase().replace(/ё/g, "е");

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 100) ?? "";

  const [products, categories] = query ? await Promise.all([getProducts(), getAllCategories()]) : [[], []];
  const categoryTitle = new Map(categories.map((c) => [c.slug, c.title]));
  // каждое слово запроса должно найтись в названии, описании или категории товара
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const found = products.filter((p) => {
    const text = normalize(`${p.title} ${p.shortDescription} ${categoryTitle.get(p.categorySlug) ?? ""}`);
    return words.every((w) => text.includes(w.length > 4 ? w.slice(0, -1) : w)); // «стулья» найдёт «стул»
  });

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <Breadcrumbs
          items={[
            { name: "Главная", href: "/" },
            { name: "Поиск", href: "/search" },
          ]}
        />
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 mb-6 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {query ? `Поиск: «${query}»` : "Поиск по каталогу"}
          </h1>
          <div className="max-w-xl">
            <SearchForm defaultValue={query} autoFocus={!query} />
          </div>
          {query && (
            <p className="text-sm text-slate-500">
              {found.length > 0
                ? `Найдено ${found.length} ${plural(found.length, ["товар", "товара", "товаров"])}`
                : "Ничего не нашлось. Попробуйте другое слово или посмотрите весь каталог."}
            </p>
          )}
        </div>
        {found.length > 0 && <ProductGrid products={found} />}
      </div>
    </div>
  );
}
