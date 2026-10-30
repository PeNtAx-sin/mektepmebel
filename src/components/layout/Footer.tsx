import Link from "next/link";
import { site, type MenuItem } from "@/lib/site";

export default function Footer({ catalogMenu, showBlog }: { catalogMenu: MenuItem[]; showBlog: boolean }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 pt-12 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-school-blue rounded-xl flex items-center justify-center text-white">
              <i className="fa-solid fa-graduation-cap" />
            </div>
            <span className="text-lg font-black text-white uppercase">{site.name}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Надежный поставщик школьной мебели в Казахстане. ГОСТ, сертификаты, гарантия и
            тендерное сопровождение.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-white mb-4">Каталог</h2>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/catalog" className="hover:text-white transition">
                Весь каталог
              </Link>
            </li>
            {catalogMenu.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white transition">
                  {item.title}
                </Link>
              </li>
            ))}
            {showBlog && (
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Полезные статьи
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* TODO: колонка «Компания», когда появятся страницы из mainNav (см. site.ts) */}

        <div>
          <h2 className="font-bold text-white mb-4">Контакты</h2>
          <div className="space-y-2 text-xs">
            <p>
              <i className="fa-solid fa-phone text-brand-500 mr-2" />
              <a href={site.phoneHref} className="hover:text-white transition">
                {site.phone}
              </a>
            </p>
            <p>
              <i className="fa-solid fa-envelope text-brand-500 mr-2" />
              <a href={`mailto:${site.email}`} className="hover:text-white transition">
                {site.email}
              </a>
            </p>
            <p>
              <i className="fa-solid fa-location-dot text-brand-500 mr-2" />
              {site.address}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
        <p>© {year} {site.name}. Все права защищены.</p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <Link href="/admin" rel="nofollow" className="hover:text-white">
            Панель управления (CRM)
          </Link>
        </div>
      </div>
    </footer>
  );
}