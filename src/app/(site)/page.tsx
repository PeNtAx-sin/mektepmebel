import type { Metadata } from "next";
import Link from "next/link";
import ProjectsSection from "@/components/home/ProjectsSection";
import RoomShowcase from "@/components/home/RoomShowcase";
import OpenTenderButton from "@/components/OpenTenderButton";
import {
  getCategories,
  getFeaturedProduct,
  getProductsCount,
  getProjects,
  getRoomShowcase,
} from "@/lib/data";
import Image from "next/image";
import { formatPrice, vatLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: {
    absolute: "Mektep Mebel — Школьная и учебная мебель в Казахстане по ГОСТу",
  },
  description:
    "Школьные парты и стулья, парты для кабинетов химии и физики, спецмебель. Доставка по Казахстану, документы для госзакупок. Запросите смету.",
  alternates: { canonical: "/" },
};

// TODO: заменить реальными данными компании
const trustBadges = [
  { icon: "fa-check-circle", text: "Гарантия от 3 до 5 лет" },
  { icon: "fa-truck-fast", text: "Доставка по всему РК" },
  { icon: "fa-file-contract", text: "Полный пакет документов" },
];

// TODO: проверить каждое утверждение (склады, документы, сертификаты)
const advantages = [
  {
    icon: "fa-certificate",
    iconBox: "bg-brand-50 text-brand-600",
    title: "ГОСТ и СанПиН",
    text: "Вся продукция строго соответствует требованиям безопасности учебных заведений Республики Казахстан.",
  },
  {
    icon: "fa-warehouse",
    iconBox: "bg-blue-50 text-school-blue",
    title: "Склады в Алматы и Астане",
    text: "Крупнейший складской запас в наличии. Отгружаем заказы любого объема в день подтверждения.",
  },
  {
    icon: "fa-clipboard-check",
    iconBox: "bg-amber-50 text-school-wood",
    title: "Полный пакет тендерной документации",
    text: "Предоставляем сертификаты соответствия, СТ-KZ, паспорта изделий и закрывающие документы для бухгалтерии.",
  },
];

export default async function HomePage() {
  const [categories, showcase, projects, productsCount] = await Promise.all([
    getCategories(),
    getRoomShowcase(),
    getProjects(),
    getProductsCount(),
  ]);
  // пока в Studio нет 3D-кабинетов, на первом экране — карточка товара
  const featured = showcase ? null : await getFeaturedProduct();

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative bg-gradient-to-br from-slate-900 via-school-blue to-slate-900 text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className={`${showcase ? "lg:col-span-6" : "lg:col-span-7"} space-y-6`}>
            <span className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-400 border border-brand-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              <i className="fa-solid fa-shield-halved" /> Сертифицированная школьная
              мебель по ГОСТ
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Комфортная учеба <span className="text-brand-400">начинается</span> с
              правильной парты
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Прямые поставки от производителя для общеобразовательных школ, гимназий,
              университетов и детских садов по всему Казахстану. Полный пакет документов
              для тендеров (ГосЗакуп).
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/catalog"
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-3 text-sm sm:text-base"
              >
                <i className="fa-solid fa-box-open" /> Перейти в каталог
              </Link>
              <OpenTenderButton className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-8 py-4 rounded-xl transition flex items-center justify-center gap-3 text-sm sm:text-base backdrop-blur-sm">
                <i className="fa-solid fa-calculator text-brand-400" /> Рассчитать тендер /
                смету
              </OpenTenderButton>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800 text-slate-300 text-xs sm:text-sm">
              {trustBadges.map((b) => (
                <div key={b.text} className="flex items-center gap-2">
                  <i className={`fa-solid ${b.icon} text-brand-400 text-lg`} />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          {showcase && (
            <div className="lg:col-span-6">
              <RoomShowcase showcase={showcase} projectIds={projects.map((p) => p.id)} />
            </div>
          )}

          {featured && (
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative">
                {featured.image && (
                  <Image
                    src={featured.image}
                    alt={featured.imageAlt}
                    width={600}
                    height={400}
                    priority
                    className="rounded-2xl w-full h-56 object-contain bg-white p-3 mb-6 shadow-inner"
                  />
                )}
                <h2 className="text-xl font-bold text-white mb-2">{featured.title}</h2>
                {featured.shortDescription && (
                  <p className="text-slate-300 text-xs mb-4">{featured.shortDescription}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-brand-400">
                    {featured.price != null ? formatPrice(featured.price) : "Цена по запросу"}
                    {featured.price != null && (
                      <span className="block text-xs font-normal text-slate-300">
                        {vatLabel(featured.vatIncluded)}
                      </span>
                    )}
                  </span>
                  <Link
                    href={`/catalog/${featured.categorySlug}/${featured.slug}`}
                    className="bg-white text-slate-900 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-100 transition"
                  >
                    Подробнее <i className="fa-solid fa-arrow-right ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============ ГОТОВЫЕ ПРОЕКТЫ ============ */}
      {projects.length > 0 && <ProjectsSection projects={projects} />}

      {/* ============ КАТЕГОРИИ ============ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <span className="text-brand-600 font-bold text-xs uppercase tracking-wider block mb-2">
              Категории продукции
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Всё необходимое для оснащения учебных заведений
            </h2>
          </div>
          <Link
            href="/catalog"
            className="mt-4 md:mt-0 text-school-blue font-bold text-sm hover:underline flex items-center gap-1.5"
          >
            Смотреть весь каталог ({productsCount} товаров){" "}
            <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/catalog/${c.slug}`}
              className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 rounded-2xl overflow-hidden mb-6 bg-slate-100">
                  {c.image ? (
                    <Image
                      src={c.image}
                      alt={c.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-5xl">
                      <i className="fa-solid fa-couch" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-school-blue transition mb-2">
                  {c.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4">{c.description}</p>
              </div>
              <div className="flex items-center text-xs font-semibold text-school-blue gap-1">
                <span>Смотреть модели</span>
                <i className="fa-solid fa-chevron-right text-[10px]" />
              </div>
            </Link>
          ))}

          {/* Карточка: тендеры. TODO: ссылка на /dlya-shkol, когда появится страница */}
          <div className="group bg-gradient-to-br from-school-blue to-slate-900 text-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-brand-400 text-xl">
                <i className="fa-solid fa-handshake" />
              </div>
              <h3 className="text-xl font-bold mb-2">Оптовые закупки и тендеры</h3>
              <p className="text-slate-300 text-sm mb-4">
                Полное сопровождение госзакупок, спецификации, коммерческие предложения за
                15 минут.
              </p>
            </div>
            <OpenTenderButton className="flex items-center text-xs font-semibold text-brand-400 hover:text-brand-500 gap-1 self-start">
              <span>Запросить смету</span>
              <i className="fa-solid fa-arrow-right" />
            </OpenTenderButton>
          </div>
        </div>
      </section>

      {/* ============ ПРЕИМУЩЕСТВА ============ */}
      <section className="bg-slate-100 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-brand-600 font-bold text-xs uppercase tracking-wider block mb-2">
              Наши преимущества
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Почему школы и гимназии выбирают нас
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advantages.map((a) => (
              <div
                key={a.title}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200"
              >
                <div
                  className={`w-14 h-14 ${a.iconBox} rounded-2xl flex items-center justify-center text-2xl mb-6`}
                >
                  <i className={`fa-solid ${a.icon}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{a.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}