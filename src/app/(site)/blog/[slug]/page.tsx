import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/blog/ArticleBody";
import Breadcrumbs from "@/components/catalog/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import OpenTenderButton from "@/components/OpenTenderButton";
import RelatedLinks from "@/components/seo/RelatedLinks";
import { getArticle, getArticles } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { imageObject, ORGANIZATION_ID } from "@/lib/schema";
import { absoluteUrl, fitTitle, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return pageMetadata({
    title: fitTitle(article.seoTitle, article.title),
    description: article.seoDescription || article.excerpt || article.title,
    path: `/blog/${article.slug}`,
    image: article.cover,
    imageAlt: article.coverAlt,
    type: "article",
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const path = `/blog/${article.slug}`;

  return (
    <div className="py-12">
      <article className="max-w-3xl mx-auto px-4 sm:px-8">
        <Breadcrumbs
          items={[
            { name: "Главная", href: "/" },
            { name: "Статьи", href: "/blog" },
            { name: article.title, href: path },
          ]}
        />

        <header className="space-y-3 mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">{article.title}</h1>
          <time dateTime={article.publishedAt} className="block text-sm text-slate-400">
            {formatDate(article.publishedAt)}
          </time>
          {article.excerpt && <p className="text-lg text-slate-600 leading-relaxed">{article.excerpt}</p>}
        </header>

        {article.cover && (
          <div className="relative aspect-[16/9] mb-8 rounded-3xl overflow-hidden bg-slate-100">
            <Image
              src={article.cover}
              alt={article.coverAlt}
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <ArticleBody value={article.body} />

        <div className="mt-10 bg-gradient-to-br from-school-blue to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="font-semibold">Подберём мебель под вашу задачу и рассчитаем смету.</p>
          <OpenTenderButton className="shrink-0 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition">
            Запросить смету
          </OpenTenderButton>
        </div>

        <RelatedLinks
          title="Смотрите в каталоге"
          links={[...article.categories, { title: "Весь каталог", href: "/catalog" }]}
        />
      </article>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${absoluteUrl(path)}#article`,
          headline: article.title,
          description: article.seoDescription || article.excerpt || undefined,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          mainEntityOfPage: absoluteUrl(path),
          inLanguage: "ru",
          author: { "@id": ORGANIZATION_ID },
          publisher: { "@id": ORGANIZATION_ID },
          ...(article.cover && { image: imageObject(article.cover, article.coverAlt) }),
        }}
      />
    </div>
  );
}
