import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";
import type { Product } from "@/lib/data";
import { formatPrice, vatLabel } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const href = `/catalog/${product.categorySlug}/${product.slug}`;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-xl transition flex flex-col justify-between group">
      <div>
        <Link
          href={href}
          className="block relative h-56 rounded-2xl overflow-hidden mb-4 bg-white border border-slate-100"
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.imageAlt}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain p-3 group-hover:scale-105 transition duration-300"
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-slate-300 text-5xl">
              <i className="fa-solid fa-couch" />
            </span>
          )}
        </Link>

        <h3 className="font-bold text-slate-900 text-base mb-2">
          <Link href={href} className="hover:text-school-blue transition line-clamp-2">
            {product.title}
          </Link>
        </h3>
        {product.shortDescription && (
          <p className="text-slate-500 text-xs line-clamp-2 mb-4">
            {product.shortDescription}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mb-3">
          <span className="text-xs text-slate-500">
            {product.inStock ? "Цена за шт:" : "Под заказ"}
          </span>
          <span className="text-lg font-black text-slate-900 text-right leading-tight">
            {product.price != null ? formatPrice(product.price) : "По запросу"}
            {product.price != null && (
              <span className="block text-[11px] font-normal text-slate-500">
                {vatLabel(product.vatIncluded)}
              </span>
            )}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href={href}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 rounded-xl text-xs transition text-center"
          >
            Подробнее
          </Link>
          <AddToCartButton
            variant="icon"
            item={{
              id: product.id,
              slug: product.slug,
              categorySlug: product.categorySlug,
              title: product.title,
              price: product.price,
              vatIncluded: product.vatIncluded,
            }}
          />
        </div>
      </div>
    </div>
  );
}