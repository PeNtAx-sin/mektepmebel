"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";

const fmt = (n: number) => n.toLocaleString("ru-RU");

export default function CartModal() {
  const { items, total, hasUnpriced, setQty, remove, clear } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-cart-modal", onOpen);
    return () => window.removeEventListener("open-cart-modal", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const requestQuote = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("open-tender-modal"));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 relative flex flex-col max-h-[90vh]"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Закрыть"
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-lg"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        <h2 id="cart-title" className="text-2xl font-black text-slate-900 mb-2">
          Ваша смета
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm mb-4">
          Выбранные товары для предварительного расчета стоимости.
        </p>

        <div className="flex-1 overflow-y-auto space-y-3 my-2 pr-1">
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm space-y-3">
              <p>Ваша смета пуста. Добавьте товары из каталога.</p>
              <Link
                href="/catalog"
                onClick={() => setOpen(false)}
                className="inline-block text-school-blue font-bold hover:underline"
              >
                Перейти в каталог
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100"
              >
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                  <span className="text-xs text-slate-500">
                    {item.price != null ? `${fmt(item.price)} ₸ / шт.` : "Цена по запросу"}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => setQty(item.id, item.qty - 1)}
                      aria-label="Уменьшить количество"
                      className="px-2.5 py-1.5 hover:bg-slate-100 font-bold"
                    >
                      −
                    </button>
                    <span className="px-2.5 py-1.5 font-semibold min-w-8 text-center">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(item.id, item.qty + 1)}
                      aria-label="Увеличить количество"
                      className="px-2.5 py-1.5 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-black text-sm text-slate-900 w-24 text-right">
                    {item.price != null ? `${fmt(item.price * item.qty)} ₸` : "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label="Удалить из сметы"
                    className="text-slate-400 hover:text-red-500 text-xs p-1"
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 pt-4 mt-2 space-y-4">
          <div className="flex justify-between items-center text-lg font-black text-slate-900">
            <span>{hasUnpriced ? "Итого (позиции с ценой):" : "Итого по смете:"}</span>
            <span className="text-brand-600">{fmt(total)} ₸</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={clear}
              disabled={items.length === 0}
              className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold py-3 rounded-xl text-sm transition"
            >
              Очистить
            </button>
            <button
              type="button"
              onClick={requestQuote}
              disabled={items.length === 0}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm shadow transition"
            >
              Запросить КП
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}