import { site } from "@/lib/site";

export default function TopBar() {
  return (
    <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex justify-center sm:justify-between items-center gap-2">
        <div className="hidden sm:flex items-center gap-2">
          <i className="fa-solid fa-location-dot text-brand-500" />
          <span>Доставка по всему Казахстану</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href={site.phoneHref}
            className="hover:text-white transition flex items-center gap-1.5 py-1 text-sm sm:text-xs"
          >
            <i className="fa-solid fa-phone text-brand-500" /> {site.phone}
          </a>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-emerald-400">
            <i className="fa-solid fa-circle text-[8px] mr-1" /> Работаем с госзакупками и
            тендерами
          </span>
        </div>
      </div>
    </div>
  );
}