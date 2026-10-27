import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextBlock, type PortableTextComponents } from "next-sanity";
import { urlFor } from "@/sanity/lib/image";
import { site } from "@/lib/site";

// Свои ссылки — обычные; внешние открываются в новой вкладке с nofollow,
// чтобы не передавать вес сайта чужим страницам
const isInternal = (href: string) => href.startsWith("/") || href.startsWith(site.url);

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="text-2xl font-black text-slate-900 pt-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold text-slate-900 pt-2">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-brand-500 bg-brand-50 px-5 py-3 rounded-r-xl text-slate-700">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 space-y-1.5">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 space-y-1.5">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => {
      const href: string = value?.href ?? "#";
      return isInternal(href) ? (
        <Link href={href.replace(site.url, "") || "/"} className="text-school-blue underline underline-offset-2">
          {children}
        </Link>
      ) : (
        <a href={href} target="_blank" rel="nofollow noopener noreferrer" className="text-school-blue underline underline-offset-2">
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) =>
      value?.asset ? (
        <figure className="my-2">
          <Image
            src={urlFor(value).url()}
            alt={value.alt ?? ""}
            width={1200}
            height={800}
            sizes="(min-width: 768px) 768px, 100vw"
            className="w-full h-auto rounded-2xl"
          />
          {value.alt && <figcaption className="mt-2 text-xs text-slate-500 text-center">{value.alt}</figcaption>}
        </figure>
      ) : null,
  },
};

export default function ArticleBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-slate-700">
      <PortableText value={value} components={components} />
    </div>
  );
}
