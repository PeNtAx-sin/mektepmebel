import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import { getArticles } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const articles = await getArticles();
  return pageMetadata({
    title: "Статьи о школьной мебели и стульях",
    description:
      "Полезные статьи: как подобрать парту и стул по росту ученика, как выбрать стулья для кафе и дома, как оснастить школьный кабинет.",
    path: "/blog",
    noindex: articles.length === 0,
  });
}

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <Breadcrumbs
          items={[
            { name: "Главная", href: "/" },
            { name: "Статьи", href: "/blog" },
          ]}
        />
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-8">Полезные статьи</h1>

        {articles.length === 0 ? (
          <p className="text-slate-500">Статьи скоро появятся.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col"
              >
                <div className="relative aspect-[16/9] bg-slate-100">
                  {a.cover ? (
                    <Image
                      src={a.cover}
                      alt={a.coverAlt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-5xl">
                      <i className="fa-solid fa-book-open" />
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-2">
                  <time dateTime={a.publishedAt} className="text-xs text-slate-400">
                    {formatDate(a.publishedAt)}
                  </time>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-school-blue transition leading-snug">
                    {a.title}
                  </h2>
                  {a.excerpt && <p className="text-sm text-slate-600 line-clamp-3">{a.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
