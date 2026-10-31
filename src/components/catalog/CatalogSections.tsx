"use client";

import Link from "next/link";
import { useState } from "react";
import type { CatalogSection } from "@/lib/data";
import { plural } from "@/lib/format";
import { GridToolbar, ProductCards, sortProducts, type SortMode } from "./ProductGrid";

/** Общий каталог и общие разделы: товары разделами по категориям, сортировка — внутри каждого раздела */
export default function CatalogSections({ sections }: { sections: CatalogSection[] }) {
  const [sort, setSort] = useState<SortMode>("popular");
  const total = sections.reduce((n, s) => n + s.products.length, 0);

  return (
    <div>
      <GridToolbar count={total} sort={sort} onSort={setSort} />

      <div className="space-y-16">
        {sections.map((section) => (
          <section key={section.slug} aria-labelledby={`section-${section.slug}`}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-slate-200 pb-3 mb-6">
              <h2
                id={`section-${section.slug}`}
                className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-slate-900"
              >
                {section.title}
              </h2>
              <Link
                href={`/catalog/${section.slug}`}
                className="text-xs font-semibold text-school-blue hover:underline shrink-0"
              >
                {section.products.length}{" "}
                {plural(section.products.length, ["товар", "товара", "товаров"])} — открыть
                категорию <i className="fa-solid fa-arrow-right ml-1" />
              </Link>
            </div>
            <ProductCards products={sortProducts(section.products, sort)} />
          </section>
        ))}
      </div>
    </div>
  );
}
