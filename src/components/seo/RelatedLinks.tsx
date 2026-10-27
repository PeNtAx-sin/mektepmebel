import Link from "next/link";

/** Перелинковка: «Смотрите также» со ссылками на соседние разделы */
export default function RelatedLinks({
  links,
  title = "Смотрите также",
}: {
  links: { title: string; href: string }[];
  title?: string;
}) {
  if (links.length === 0) return null;
  return (
    <nav aria-label={title} className="mt-10">
      <h2 className="text-lg font-black text-slate-900 mb-3">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="bg-white border border-slate-200 hover:border-school-blue hover:text-school-blue px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            {l.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
