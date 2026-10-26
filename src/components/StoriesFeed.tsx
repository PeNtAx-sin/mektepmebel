import Link from 'next/link';
import { client } from "@/sanity/lib/client";
import ProductFeed from "@/components/ProductFeed";
import Features from "@/components/Features";
import CalculatorModal from "@/components/CalculatorModal";

// Тип данных из Sanity
interface Product {
  _id: string;
  title: string;
  category: string;
  slug: { current: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
  price: number;
  priceVat: number;
  shortDescription?: string;
}

export default async function Home() {
  // Получаем товары из Sanity CMS с защитой от пустоты
  const rawProducts = await client.fetch<Product[]>(
    `*[_type == "product"] | order(_createdAt desc)`
  );
  
  const products = rawProducts || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      
      {/* Верхняя планка с городами и тендерами */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">📍</span>
            <span>Город поставки:</span>
            <span className="text-white font-semibold">Алматы, Астана, Шымкент (+ склады по РК)</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="tel:+77471719253" className="hover:text-white transition font-medium">
              📞 +7 (747) 171-92-53
            </a>
            <span className="hidden md:inline text-emerald-400 font-medium">
              ⚡ Работаем с ГосЗакупками и тендерами
            </span>
          </div>
        </div>
      </div>

      {/* Навигация (Шапка сайта) */}
      <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Логотип */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-900 rounded-xl flex items-center justify-center text-white shadow-md font-black text-xl">
                M
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">МЕКТЕП МЕБЕЛ</span>
                <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">Школьная мебель в Казахстане</span>
              </div>
            </Link>

            {/* Меню */}
            <nav className="hidden lg:flex items-center gap-8 font-semibold text-sm text-slate-700">
              <Link href="/" className="hover:text-blue-900 transition">Главная</Link>
              <Link href="#catalog" className="hover:text-blue-900 transition">Каталог</Link>
              <Link href="#features" className="hover:text-blue-900 transition">Преимущества</Link>
              <Link href="#tenders" className="hover:text-blue-900 transition">ГосЗакуп / Тендеры</Link>
            </nav>

            {/* Кнопка Админки */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-800 transition shadow-sm">
                🔒 Вход в CRM
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент главной страницы */}
      <main className="flex-grow">
        
        {/* Hero Секция */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-20 lg:py-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                🛡️ Сертифицированная мебель строго по ГОСТ и СанПиН
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Оснащение школ и кабинетов <span className="text-emerald-400">под ключ</span> в РК
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Поставки школьных парт, стульев, моноблоков и интерактивных панелей со складов в Алматы и Астане. Полный пакет закрывающих документов для бухгалтерии.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a href="#catalog" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition text-center text-sm sm:text-base">
                  📦 Смотреть каталог
                </a>
              </div>
            </div>

            {/* Плашка с хитом */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative">
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                  Хит госзакупок
                </div>
                <div className="bg-slate-800 rounded-2xl w-full h-56 flex items-center justify-center text-slate-400 mb-6 font-bold text-lg shadow-inner">
                  Мектеп Мебел Склад
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Парты и стулья регулируемые</h3>
                <p className="text-slate-300 text-xs mb-4">Ростовые группы 2-5, антисколиозный эргономичный дизайн.</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-emerald-400">Оптом и в розницу</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Секция Преимуществ */}
        <div id="features">
          <Features />
        </div>

        {/* Секция Каталога (Рендерит товары из Sanity) */}
        <div id="catalog" className="py-16 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="mb-10">
            <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider block mb-2">Актуальный ассортимент</span>
            <h2 className="text-3xl font-black text-slate-900">Каталог школьной мебели</h2>
          </div>
          
          <ProductFeed products={products} />
        </div>

      </main>

      {/* Модальное окно сметы / калькулятора */}
      <CalculatorModal />

      {/* Футер */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-white font-bold text-base block mb-1">Мектеп Мебел (mektepmebel.kz)</span>
            <p className="text-xs">Поставки учебной мебели по всем городам Казахстана.</p>
          </div>
          <div className="flex gap-6 text-xs">
            <Link href="/admin" className="hover:text-white transition">Панель управления CRM</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}