import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { site } from "@/lib/site";

export type Crumb = { name: string; href: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav
        aria-label="Хлебные крошки"
        className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-6"
      >
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <span key={item.href} className="flex items-center gap-2">
              {i > 0 && <i className="fa-solid fa-chevron-right text-[9px]" />}
              {last ? (
                <span className="font-semibold text-slate-800" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-school-blue">
                  {item.name}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: `${site.url}${item.href}`,
          })),
        }}
      />
    </>
  );
}