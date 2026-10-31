import type { Metadata } from "next";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import CatalogSidebar from "@/components/catalog/CatalogSidebar";
import CatalogSections from "@/components/catalog/CatalogSections";
import { catalogSections, getAllCategories, getProducts } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Каталог школьной мебели и стульев",
  description:
    "Каталог: школьные парты, пластиковые стулья для школы, дома и кафе, парты для химии и физики, спецмебель. Цены, характеристики, доставка по Казахстану.",
  path: "/catalog",
});

export default async function CatalogPage() {
  const [categories, products] = await Promise.all([getAllCategories(), getProducts()]);

  const sections = catalogSections(categories, products);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <Breadcrumbs
          items={[
            { name: "Главная", href: "/" },
            { name: "Каталог", href: "/catalog" },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-8">
          <CatalogSidebar categories={categories} />

          <div className="flex-grow min-w-0">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Общий каталог школьной мебели
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Все товары по категориям: парты, стулья, мебель для кабинетов химии и физики
              </p>
            </div>
            <CatalogSections sections={sections} />
          </div>
        </div>
      </div>
    </div>
  );
}