"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Конструктор коммерческого предложения: шапка (дата, компания), позиции из каталога
// с ценой и количеством → скачивание .docx (собирается в /admin/offer/docx)

type CatalogProduct = {
  id: string;
  title: string;
  category: string;
  price: number | null;
  vatIncluded: boolean;
  image: string | null;
};

type Line = { key: number; productId: string; price: string; quantity: string };

// адрес от origin: если админку открыли как http://admin:пароль@сайт/admin,
// относительный fetch браузер отклоняет
const api = (path: string) => new URL(path, window.location.origin).toString();

const today = () => new Date().toLocaleDateString("sv-SE"); // ГГГГ-ММ-ДД в местном времени
const fmt = (n: number) => `${n.toLocaleString("ru-RU")} ₸`;

const inputCls =
  "w-full px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl focus:border-school-blue focus:ring-4 focus:ring-school-blue/10 outline-none transition";
const labelCls = "text-xs font-semibold uppercase tracking-wider text-slate-500";

let nextKey = 1;
const emptyLine = (): Line => ({ key: nextKey++, productId: "", price: "", quantity: "1" });

export default function OfferBuilder() {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [loadError, setLoadError] = useState("");

  const [date, setDate] = useState(today);
  const [company, setCompany] = useState("");
  const [vatIncluded, setVatIncluded] = useState(true);
  const [lines, setLines] = useState<Line[]>(() => [emptyLine()]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(api("/admin/offer/products"))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: CatalogProduct[]) => setProducts(data))
      .catch((e: Error) => setLoadError(`Не удалось загрузить каталог (${e.message}). Обновите страницу.`));
  }, []);

  const byId = new Map((products ?? []).map((p) => [p.id, p]));
  const categories = [...new Set((products ?? []).map((p) => p.category))];

  const updateLine = (key: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  // при выборе товара подставляем цену из каталога (её можно поменять)
  const pickProduct = (line: Line, productId: string) => {
    const product = byId.get(productId);
    const prevProduct = byId.get(line.productId);
    const priceUntouched = line.price === "" || (prevProduct?.price != null && Number(line.price) === prevProduct.price);
    updateLine(line.key, {
      productId,
      ...(priceUntouched && { price: product?.price != null ? String(product.price) : "" }),
    });
  };

  const filled = lines.filter((l) => l.productId);
  const total = filled.reduce((s, l) => s + (Number(l.price) || 0) * (Number(l.quantity) || 0), 0);
  const invalidLine = filled.find(
    (l) => l.price === "" || Number(l.price) < 0 || !Number.isInteger(Number(l.quantity)) || Number(l.quantity) < 1,
  );
  const canGenerate = Boolean(company.trim() && date && filled.length > 0 && !invalidLine && !isGenerating);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch(api("/admin/offer/docx"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          date,
          company: company.trim(),
          vatIncluded,
          items: filled.map((l) => ({ productId: l.productId, price: Number(l.price), quantity: Number(l.quantity) })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Ошибка сервера (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `КП ${company.trim().replace(/[\\/:*?"<>|]+/g, " ")} ${date}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать файл");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Шапка предложения */}
      <section className="bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-slate-200/70 space-y-5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-school-blue/10 text-school-blue flex items-center justify-center">
            <i className="fa-solid fa-file-signature" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Шапка предложения</h2>
            <p className="text-xs text-slate-400">Дата и компания попадут в заголовок документа</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5">
          <div className="flex flex-col gap-2">
            <label className={labelCls} htmlFor="offer-date">Дата</label>
            <input id="offer-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelCls} htmlFor="offer-company">Компания</label>
            <input id="offer-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Например: КГУ «Школа-гимназия №12»" className={inputCls} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className={labelCls}>Цены в предложении</span>
          <div className="grid grid-cols-2 gap-2 max-w-md">
            {[
              { value: true, label: "С НДС" },
              { value: false, label: "Без НДС" },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => setVatIncluded(o.value)}
                className={`px-3 py-3 rounded-xl border text-sm font-semibold transition ${
                  vatIncluded === o.value
                    ? "bg-school-blue/10 border-school-blue/40 text-school-blue"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Позиции */}
      <section className="bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-slate-200/70 space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <i className="fa-solid fa-list-check" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Позиции</h2>
            <p className="text-xs text-slate-400">Выберите товар — цена подставится из каталога, её можно изменить</p>
          </div>
        </div>

        {loadError && <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">{loadError}</p>}

        {lines.map((line, index) => {
          const product = byId.get(line.productId);
          const sum = (Number(line.price) || 0) * (Number(line.quantity) || 0);
          return (
            <div key={line.key} className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              {/* на телефоне список товаров — отдельной строкой на всю ширину */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <span className="shrink-0 w-6 text-sm font-bold text-slate-400 text-center">{index + 1}</span>
                <div className="relative shrink-0 w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden">
                  {product?.image ? (
                    <Image src={product.image} alt={product.title} fill sizes="56px" className="object-contain p-1" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <i className="fa-solid fa-chair" />
                    </span>
                  )}
                </div>
                <select
                  value={line.productId}
                  onChange={(e) => pickProduct(line, e.target.value)}
                  disabled={!products}
                  aria-label={`Товар, позиция ${index + 1}`}
                  className={`${inputCls} order-last sm:order-none basis-full sm:basis-auto sm:flex-1 min-w-0 cursor-pointer disabled:cursor-wait disabled:bg-slate-100`}
                >
                  <option value="">{products ? "Выберите товар…" : "Загружаю каталог…"}</option>
                  {categories.map((cat) => (
                    <optgroup key={cat} label={cat}>
                      {(products ?? [])
                        .filter((p) => p.category === cat)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                            {p.price != null ? ` — ${p.price.toLocaleString("ru-RU")} ₸` : ""}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLines((ls) => ls.filter((l) => l.key !== line.key))}
                    aria-label="Убрать позицию"
                    className="shrink-0 ml-auto sm:ml-0 w-11 h-11 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <i className="fa-solid fa-trash-can" />
                  </button>
                )}
              </div>

              {line.productId && (
                <div className="grid grid-cols-2 sm:grid-cols-[1fr_120px_1fr] gap-3 sm:pl-9">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Цена</label>
                    <div className="relative">
                      <input type="number" min="0" value={line.price} onChange={(e) => updateLine(line.key, { price: e.target.value })} placeholder="0" className={`${inputCls} pr-8`} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">₸</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Кол-во</label>
                    <div className="relative">
                      <input type="number" min="1" step="1" value={line.quantity} onChange={(e) => updateLine(line.key, { quantity: e.target.value })} className={`${inputCls} pr-9 text-center`} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">шт</span>
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                    <span className={labelCls}>Сумма</span>
                    <div className="px-4 py-3 rounded-xl bg-white border border-slate-100 text-base font-bold text-slate-900 whitespace-nowrap">{fmt(sum)}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setLines((ls) => [...ls, emptyLine()])}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-sm font-semibold text-school-blue hover:border-school-blue/40 hover:bg-school-blue/5 transition"
        >
          <i className="fa-solid fa-plus mr-2" />
          Добавить позицию
        </button>
      </section>

      {/* Итог и скачивание */}
      <section className="bg-gradient-to-br from-school-blue to-slate-900 text-white p-5 md:p-7 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
            Итого · {filled.length} {filled.length === 1 ? "позиция" : filled.length >= 2 && filled.length <= 4 ? "позиции" : "позиций"} · {vatIncluded ? "с НДС" : "без НДС"}
          </p>
          <p className="text-2xl md:text-3xl font-black mt-1 whitespace-nowrap">{fmt(total)}</p>
          {!canGenerate && !isGenerating && (
            <p className="text-xs text-blue-200 mt-1">
              {!company.trim()
                ? "Укажите компанию"
                : filled.length === 0
                  ? "Выберите хотя бы один товар"
                  : invalidLine
                    ? "Проверьте цену и количество"
                    : ""}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-brand-500 text-white rounded-2xl shadow-lg hover:bg-brand-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <i className={`fa-solid ${isGenerating ? "fa-spinner fa-spin" : "fa-file-word"}`} />
          {isGenerating ? "Собираю документ…" : "Скачать КП (.docx)"}
        </button>
      </section>

      {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">{error}</p>}
    </div>
  );
}
