"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/data";

const INTERVAL_MS = 5000;

/** Слайдер фото готовых проектов на первом экране главной */
export default function HeroProjects({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  const go = (step: number) => setActive((i) => (i + step + count) % count);
  const slide = slides[active];

  return (
    <div
      className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-white/20 shadow-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-800"
        role="region"
        aria-roledescription="carousel"
        aria-label="Наши проекты"
      >
        {slides.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 40vw, 100vw"
            style={{ objectPosition: s.position }}
            className={`object-cover transition-opacity duration-700 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== active}
          />
        ))}

        {slide.isVisualization && (
          <span className="absolute top-3 left-3 bg-black/55 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            Визуализация
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 pt-10 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-400">
            Наши проекты
          </p>
          <p className="text-white font-bold leading-snug" aria-live="polite">
            {slide.title}
          </p>
          {slide.location && <p className="text-slate-300 text-xs">{slide.location}</p>}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Предыдущее фото"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
            >
              <i className="fa-solid fa-chevron-left text-sm" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Следующее фото"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
            >
              <i className="fa-solid fa-chevron-right text-sm" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex justify-center gap-2 pt-3">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1} из ${count}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all ${
                i === active ? "w-6 bg-brand-400" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
