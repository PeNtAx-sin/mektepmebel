"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "@/components/catalog/ProductCard";
import type { Product } from "@/lib/data";

const INTERVAL_MS = 3000;
const MAX_PER_VIEW = 4; // столько карточек видно на широком экране — их же копируем в конец ленты

// Лента товаров: каждые 3 секунды сдвигается на одну карточку и бесконечно идёт по кругу.
// Останавливается под курсором, при фокусе с клавиатуры и на скрытой вкладке.
export default function ProductCarousel({ products }: { products: Product[] }) {
  const count = products.length;
  const looped = count > 1;
  // копии первых карточек в конце: доехав до них, без анимации прыгаем в начало
  const slides = looped ? [...products, ...products.slice(0, MAX_PER_VIEW)] : products;

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const next = useCallback(() => {
    if (index < count) {
      setAnimate(true);
      setIndex(index + 1);
      return;
    }
    // стоим на копии в конце (анимация не успела закончиться): прыгаем в начало и едем дальше
    setAnimate(false);
    setIndex(0);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true);
        setIndex(1);
      }),
    );
  }, [index, count]);

  const prev = useCallback(() => {
    if (index > 0) {
      setAnimate(true);
      setIndex(index - 1);
      return;
    }
    // с первой карточки назад: незаметно встаём на копию в конце и едем на шаг влево
    setAnimate(false);
    setIndex(count);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true);
        setIndex(count - 1);
      }),
    );
  }, [index, count]);

  // автопрокрутка
  useEffect(() => {
    if (!looped || paused || reducedMotion.current) return;
    const timer = setInterval(() => {
      if (!document.hidden) next();
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [looped, paused, next]);

  // после въезда на копию первой карточки возвращаемся к настоящей без анимации
  function handleTransitionEnd(e: React.TransitionEvent) {
    if (e.target !== e.currentTarget || index < count) return;
    setAnimate(false);
    setIndex(0);
  }

  if (count === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="карусель"
    >
      <div className="overflow-hidden -mx-3">
        <div
          className={`flex [--slide:100%] sm:[--slide:50%] lg:[--slide:33.3333%] xl:[--slide:25%] ${
            animate ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" : ""
          }`}
          style={{ transform: `translateX(calc(var(--slide) * ${-index}))` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((product, i) => (
            <div
              key={`${product.id}-${i}`}
              className="shrink-0 basis-[var(--slide)] px-3 py-2 flex"
              inert={i >= count}
              aria-hidden={i >= count || undefined}
            >
              <div className="w-full flex [&>*]:w-full">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {looped && (
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={prev}
            aria-label="Предыдущий товар"
            className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition shadow-sm"
          >
            <i className="fa-solid fa-arrow-left" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Следующий товар"
            className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition shadow-sm"
          >
            <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      )}
    </div>
  );
}
