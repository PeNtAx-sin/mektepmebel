"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/data";
import { plural } from "@/lib/format";
import ProductCard from "./ProductCard";

export type SortMode = "popular" | "asc" | "desc";

export function sortProducts(products: Product[], sort: SortMode): Product[] {
  if (sort === "popular") return products;
  const priced = products.filter((p) => p.price != null);
  const unpriced = products.filter((p) => p.price == null); // «по запросу» всегда в конце
  priced.sort((a, b) =>
    sort === "asc" ? (a.price ?? 0) - (b.price ?? 0) : (b.price ?? 0) - (a.price ?? 0),
  );
  return [...priced, ...unpriced];
}

/** Строка над сеткой: число товаров и выбор сортировки */
export function GridToolbar({
  count,
  sort,
  onSort,
}: {
  count: number;
  sort: SortMode;
  onSort: (sort: SortMode) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <p className="text-sm text-slate-500">
        {count} {plural(count, ["товар", "товара", "товаров"])}
      </p>
      <label className="flex items-center gap-2 text-xs text-slate-500">
        Сортировка:
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as SortMode)}
          className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-school-blue"
        >
          <option value="popular">По умолчанию</option>
          <option value="asc">Сначала дешевле</option>
          <option value="desc">Сначала дороже</option>
        </select>
      </label>
    </div>
  );
}

export function ProductCards({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<SortMode>("popular");
  const sorted = useMemo(() => sortProducts(products, sort), [products, sort]);

  if (products.length === 0) {
    return (
      <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
        <i className="fa-solid fa-box-open text-4xl text-slate-300" />
        <p className="text-slate-600 font-semibold">
          В этой категории пока нет товаров.
        </p>
        <Link href="/catalog" className="text-school-blue font-bold text-xs underline">
          Показать весь каталог
        </Link>
      </div>
    );
  }

  return (
    <div>
      <GridToolbar count={products.length} sort={sort} onSort={setSort} />
      <ProductCards products={sorted} />
    </div>
  );
}
