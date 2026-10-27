import type { Metadata } from "next";
import Link from "next/link";
import SearchForm from "@/components/catalog/SearchForm";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="py-24 px-4">
      <div className="max-w-xl mx-auto text-center space-y-6">
        <div className="text-6xl font-black text-school-blue">404</div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Страница не найдена</h1>
        <p className="text-slate-600">
          Возможно, товар переехал или адрес набран с ошибкой. Найдите нужное через поиск или
          откройте каталог.
        </p>
        <div className="text-left">
          <SearchForm />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/catalog" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition">
            Перейти в каталог
          </Link>
          <Link href="/" className="bg-white border border-slate-200 hover:border-school-blue text-slate-700 font-semibold px-6 py-3 rounded-xl text-sm transition">
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
