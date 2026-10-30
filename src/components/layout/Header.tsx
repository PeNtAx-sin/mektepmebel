"use client";

import { useCart } from "@/components/cart/CartProvider";

import Link from "next/link";
import { useState } from "react";

import { site, type MenuItem } from "@/lib/site";

export default function Header({ catalogMenu, showBlog }: { catalogMenu: MenuItem[]; showBlog: boolean }) {
  const [open, setOpen] = useState(false);
  const { count: cartCount } = useCart();
  const closeMenu = () => setOpen(false);
  const openTender = () =>
    window.dispatchEvent(new CustomEvent("open-tender-modal"));
  const openCart = () => window.dispatchEvent(new CustomEvent("open-cart-modal"));

  return (
    <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Логотип */}
          <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 bg-school-blue rounded-xl flex items-center justify-center text-white shadow-md">
              <i className="fa-solid fa-graduation-cap text-xl" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 block leading-tight uppercase">
                {site.name}
              </span>
              <span className="hidden min-[400px]:block text-[11px] font-medium text-slate-500 tracking-wider uppercase whitespace-nowrap">
                {site.tagline}
              </span>
            </div>
          </Link>

          {/* Меню для десктопа */}
          <nav className="hidden xl:flex items-center gap-6 font-medium text-sm text-slate-700">
            <Link href="/" className="hover:text-school-blue transition py-2">
              Главная
            </Link>

            <div className="relative group py-2">
              <Link
                href="/catalog"
                className="flex items-center gap-1 hover:text-school-blue transition font-semibold text-slate-900"
              >
                Каталог
                {catalogMenu.length > 0 && (
                  <i className="fa-solid fa-chevron-down text-xs transition group-hover:rotate-180" />
                )}
              </Link>
              {catalogMenu.length > 0 && (
                <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 py-3 z-50">
                  {catalogMenu.map((item) => (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        className="block px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-school-blue font-semibold"
                      >
                        {item.title}
                      </Link>
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-6 py-1.5 text-xs hover:bg-slate-50 text-slate-600 hover:text-school-blue"
                        >
                          ↳ {child.title}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showBlog && (
              <Link href="/blog" className="hover:text-school-blue transition py-2">
                Статьи
              </Link>
            )}
          </nav>

          {/* Кнопки справа */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCart}
              aria-label="Открыть смету"
              className="relative p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <i className="fa-solid fa-cart-shopping text-lg" />
              <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            </button>

            <button
              type="button"
              onClick={openTender}
              className="hidden sm:inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow transition"
            >
              <i className="fa-solid fa-file-invoice-dollar text-brand-500" /> Запросить
              смету
            </button>

            <Link
              href="/admin"
              rel="nofollow"
              title="Админ-панель"
              aria-label="Админ-панель"
              className="hidden sm:inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              <i className="fa-solid fa-lock text-slate-600" />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Меню"
              aria-expanded={open}
              className="xl:hidden p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"} text-lg`} />
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {open && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 shadow-lg">
          <Link
            href="/"
            onClick={closeMenu}
            className="block w-full text-left font-medium py-1.5 text-slate-700 hover:text-school-blue"
          >
            Главная
          </Link>
          <Link
            href="/catalog"
            onClick={closeMenu}
            className="block w-full text-left font-semibold py-1.5 text-school-blue"
          >
            Каталог мебели
          </Link>
          {catalogMenu.length > 0 && (
            <div className="pl-4 space-y-2 border-l-2 border-slate-100 text-sm">
              {catalogMenu.map((item) => (
                <div key={item.href} className="space-y-2">
                  <Link href={item.href} onClick={closeMenu} className="block text-slate-600">
                    {item.title}
                  </Link>
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={closeMenu}
                      className="block pl-3 text-xs text-slate-500"
                    >
                      ↳ {child.title}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
          {showBlog && (
            <Link
              href="/blog"
              onClick={closeMenu}
              className="block w-full text-left font-medium py-1.5 text-slate-700 hover:text-school-blue"
            >
              Статьи
            </Link>
          )}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => {
                closeMenu();
                openTender();
              }}
              className="w-full bg-school-blue text-white py-3 rounded-xl font-semibold text-sm shadow"
            >
              Запросить смету для школы
            </button>
            <Link
              href="/admin"
              rel="nofollow"
              onClick={closeMenu}
              className="block text-center w-full bg-slate-100 text-slate-800 py-3 rounded-xl font-semibold text-sm"
            >
              Панель администратора
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}