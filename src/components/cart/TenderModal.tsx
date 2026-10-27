"use client";

import { useEffect, useState } from "react";
import { vatLabel } from "@/lib/format";
import { site } from "@/lib/site";
import { useCart } from "./CartProvider";

const fmt = (n: number) => n.toLocaleString("ru-RU");
const emptyForm = { name: "", phone: "", city: "", comment: "" };

const inputClass =
  "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-school-blue focus:ring-2 focus:ring-school-blue/20 transition";

export default function TenderModal() {
  const { items, total, hasUnpriced, clear } = useCart();
  const [open, setOpen] = useState(false);
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const onOpen = () => {
      setWaUrl(null);
      setOpen(true);
    };
    window.addEventListener("open-tender-modal", onOpen);
    return () => window.removeEventListener("open-tender-modal", onOpen);
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

  const update =
    (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lines = [
      "Здравствуйте! Запрос сметы / КП с сайта.",
      `Имя / организация: ${form.name.trim()}`,
      `Телефон: ${form.phone.trim()}`,
      `Город: ${form.city.trim()}`,
    ];
    if (form.comment.trim()) lines.push(`Комментарий: ${form.comment.trim()}`);

    if (items.length > 0) {
      lines.push("", "Товары:");
      items.forEach((it, i) => {
        const vat = it.vatIncluded != null ? ` ${vatLabel(it.vatIncluded)}` : "";
        const price = it.price != null ? ` × ${fmt(it.price)} ₸${vat}` : " (цена по запросу)";
        lines.push(`${i + 1}. ${it.title} — ${it.qty} шт.${price}`);
      });
      if (total > 0) {
        lines.push(`Итого${hasUnpriced ? " (позиции с ценой)" : ""}: ${fmt(total)} ₸`);
      }
    }

    const url = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");

    // смету не очищаем: сообщение в WhatsApp ещё не отправлено
    setWaUrl(url);
    setForm(emptyForm);
  };

  const finish = () => {
    clear();
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tender-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Закрыть"
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-lg"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        {waUrl ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-brand-50 text-brand-600 rounded-full flex items-center justify-center text-3xl">
              <i className="fa-brands fa-whatsapp" />
            </div>
            <h2 id="tender-title" className="text-2xl font-black text-slate-900">
              Заявка подготовлена
            </h2>
            <p className="text-slate-600 text-sm">
              Мы открыли WhatsApp с готовым сообщением. Нажмите «Отправить» в
              WhatsApp, чтобы менеджер получил запрос.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl shadow transition text-sm"
            >
              <i className="fa-brands fa-whatsapp" /> Открыть WhatsApp ещё раз
            </a>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={finish}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
                >
                  Готово, очистить смету
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                {items.length > 0 ? "Закрыть, смету сохранить" : "Закрыть"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 id="tender-title" className="text-2xl font-black text-slate-900 mb-2">
              Запрос сметы и тендерного расчета
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-5">
              Заполните форму, и мы подготовим сообщение для менеджера в WhatsApp.
            </p>

            {items.length > 0 && (
              <div className="mb-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1">
                <span className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  В заявку войдёт смета: {items.length} поз.
                </span>
                {items.slice(0, 4).map((it) => (
                  <div key={it.id} className="flex justify-between gap-3">
                    <span className="truncate">{it.title}</span>
                    <span className="shrink-0 font-semibold">{it.qty} шт.</span>
                  </div>
                ))}
                {items.length > 4 && <div>и ещё {items.length - 4}…</div>}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="t-name" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ваше имя / Организация
                </label>
                <input
                  id="t-name"
                  required
                  type="text"
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Школа №12 или ФИО"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="t-phone" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Телефон для связи
                </label>
                <input
                  id="t-phone"
                  required
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="+7 (777) 000-00-00"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="t-city" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Город / Регион
                </label>
                <input
                  id="t-city"
                  required
                  type="text"
                  value={form.city}
                  onChange={update("city")}
                  placeholder="Алматы, Астана..."
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="t-comment" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Комментарий / Количество учеников
                </label>
                <textarea
                  id="t-comment"
                  rows={3}
                  value={form.comment}
                  onChange={update("comment")}
                  placeholder="Требуется оснастить 10 кабинетов на 25 учеников..."
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-school-blue hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                <i className="fa-brands fa-whatsapp text-lg" /> Отправить запрос в WhatsApp
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}