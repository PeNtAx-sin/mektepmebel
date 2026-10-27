/** Поиск по каталогу: обычная форма GET → /search?q=… (работает и без JS) */
export default function SearchForm({ defaultValue = "", autoFocus = false }: { defaultValue?: string; autoFocus?: boolean }) {
  return (
    <form action="/search" method="get" role="search" className="relative">
      <label htmlFor="catalog-search" className="sr-only">
        Поиск по каталогу
      </label>
      <input
        id="catalog-search"
        type="search"
        name="q"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Поиск: парта, стул…"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm text-slate-800 outline-none focus:border-school-blue focus:bg-white"
      />
      <button
        type="submit"
        aria-label="Найти"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-slate-500 hover:text-school-blue"
      >
        <i className="fa-solid fa-magnifying-glass" />
      </button>
    </form>
  );
}
