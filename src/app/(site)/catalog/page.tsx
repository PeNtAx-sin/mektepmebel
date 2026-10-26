import type { Metadata } from "next";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import CatalogSidebar from "@/components/catalog/CatalogSidebar";
import ProductGrid from "@/components/catalog/ProductGrid";
import { getAllCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Каталог школьной мебели",
  description:
    "Каталог школьной мебели: парты, стулья, комплекты, мебель для кабинетов и детских садов. Цены, характеристики, доставка по Казахстану.",
  alternates: { canonical: "/catalog" },
};

export default async function CatalogPage() {
  const [categories, products] = await Promise.all([getAllCategories(), getProducts()]);

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
                Каталог школьной мебели
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Парты, стулья, комплекты и мебель для учебных заведений
              </p>
            </div>
            <ProductGrid products={products} />
          </div>
        </div>
      </div>
    </div>
  );
}