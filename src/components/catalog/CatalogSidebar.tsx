import Link from "next/link";
import type { Category } from "@/lib/data";
import SearchForm from "./SearchForm";

export default function CatalogSidebar({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  const top = categories.filter((c) => !c.parentSlug);
  if (top.length === 0) return null;

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-fit space-y-2">
      <div className="pb-4">
        <SearchForm />
      </div>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
        {/* не заголовок: h1 страницы должен идти первым */}
        <p className="font-bold text-lg text-slate-900">Категории</p>
        {activeSlug && (
          <Link
            href="/catalog"
            className="text-xs text-school-blue font-semibold hover:underline"
          >
            Сбросить
          </Link>
        )}
      </div>

      {top.map((cat) => {
        const children = categories.filter((c) => c.parentSlug === cat.slug);
        return (
          <div key={cat.slug}>
            <Link
              href={`/catalog/${cat.slug}`}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm hover:bg-slate-50 ${
                activeSlug === cat.slug
                  ? "bg-slate-100 text-school-blue font-semibold"
                  : "text-slate-700 font-medium"
              }`}
            >
              <span>{cat.title}</span>
              <i className="fa-solid fa-chevron-right text-xs text-slate-400" />
            </Link>
            {children.length > 0 && (
              <div className="pl-4 mt-1 mb-2 space-y-1 text-xs">
                {children.map((child) => (
                  <Link
                    key={child.slug}
                    href={`/catalog/${child.slug}`}
                    className={`block px-3 py-1.5 rounded-lg hover:text-school-blue ${
                      activeSlug === child.slug
                        ? "text-school-blue font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    · {child.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}