"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import type { RoomShowcase as RoomShowcaseData, ShowcaseRoom } from "@/lib/data";

const INTERVAL_MS = 6000;
const STAGE_RATIO = 4 / 3;
const TITLES_SIDE = 1; // по одному названию слева и справа от текущего → в ленте максимум 3

/** Место названия в ленте, % ширины: текущее по центру и шире, соседние по бокам, дальние спрятаны за краем */
const titleSlot = (off: number) => {
  if (off === 0) return { left: 25, width: 50 };
  const far = Math.abs(off) - 1;
  return { left: off > 0 ? 75 + far * 25 : -25 * far, width: 25 };
};

const mod = (a: number, n: number) => ((a % n) + n) % n;

const tabClass = (current: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-700 sm:text-sm ${
    current
      ? "border-brand-400 bg-brand-500 text-white shadow-lg"
      : "border-white/20 bg-white/10 text-slate-200 hover:bg-white/20"
  }`;

const chipClass =
  "relative flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-white shadow-lg backdrop-blur-sm transition sm:px-3 sm:py-1.5 sm:text-xs";

/** Метка мебели на модели: ведёт на товар, если он выбран в Studio */
function Pin({ pin }: { pin: ShowcaseRoom["pins"][number] }) {
  const chip = (
    <span className={`${chipClass} ${pin.href ? "group-hover:scale-105 group-hover:bg-brand-600" : ""}`}>
      <i className={`fa-solid fa-location-dot text-brand-400 ${pin.href ? "group-hover:text-white" : ""}`} />
      {pin.label}
      {/* хвостик метки указывает на предмет */}
      <span
        className={`absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-white/25 bg-slate-900/80 ${
          pin.href ? "group-hover:bg-brand-600" : ""
        }`}
      />
    </span>
  );
  const style = { left: `${pin.x}%`, top: `${pin.y}%` };
  const className = "group absolute -translate-x-1/2 -translate-y-full pb-1.5 focus:outline-none";

  return pin.href ? (
    <Link href={pin.href} style={style} className={`${className} focus-visible:[&>span]:ring-2 focus-visible:[&>span]:ring-brand-400`}>
      {chip}
    </Link>
  ) : (
    <span style={style} className={className}>
      {chip}
    </span>
  );
}

/** Витрина 3D-кабинетов на первом экране: вкладки, модель с метками мебели, ссылки */
export default function RoomShowcase({
  showcase,
  projectIds,
}: {
  showcase: RoomShowcaseData;
  projectIds: string[];
}) {
  const { rooms } = showcase;
  const n = rooms.length;
  // pos растёт без ограничений (кабинет = pos по модулю n) — так лента названий крутится по кругу без скачков.
  // leaving — уходящий кабинет; dir: 1 — новый въезжает справа, -1 — слева
  const [{ pos, leaving, dir }, setSlide] = useState<{ pos: number; leaving: number | null; dir: number }>({
    pos: 0,
    leaving: null,
    dir: 1,
  });
  const active = mod(pos, n);

  const go = (delta: number) =>
    delta !== 0 && setSlide((s) => ({ pos: s.pos + delta, leaving: mod(s.pos, n), dir: Math.sign(delta) }));

  // смена каждые 6 с; после клика отсчёт начинается заново
  useEffect(() => {
    if (n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(
      () => setSlide((s) => ({ pos: s.pos + 1, leaving: mod(s.pos, n), dir: 1 })),
      INTERVAL_MS,
    );
    return () => clearTimeout(timer);
  }, [n, pos]);

  const room = rooms[active];
  const hasProject = room.projectId != null && projectIds.includes(room.projectId);
  const ticker = n > TITLES_SIDE * 2; // хватает кабинетов, чтобы лента не показывала одно название дважды

  return (
    <div className="space-y-4">
      {showcase.title && (
        <h2 className="text-center font-black text-2xl sm:text-3xl lg:text-4xl leading-tight text-white">
          {showcase.title}
        </h2>
      )}

      {ticker ? (
        // лента названий: текущее по центру, по бокам соседние; при смене едет на одно название
        <div
          role="tablist"
          aria-label="3D-кабинеты"
          className="relative mx-auto h-9 max-w-lg overflow-hidden sm:h-10"
          style={{ maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}
        >
          {Array.from({ length: TITLES_SIDE * 2 + 3 }, (_, k) => k - TITLES_SIDE - 1).map((off) => {
            const v = pos + off;
            const r = rooms[mod(v, n)];
            const hidden = Math.abs(off) > TITLES_SIDE;
            return (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={off === 0}
                aria-controls="room-stage"
                aria-hidden={hidden}
                tabIndex={hidden ? -1 : 0}
                onClick={() => go(off)}
                className={`absolute inset-y-0 flex items-center justify-center px-1 transition-[left,width,opacity] duration-700 ease-out ${
                  hidden ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
                style={{ left: `${titleSlot(off).left}%`, width: `${titleSlot(off).width}%` }}
              >
                <span className={`${tabClass(off === 0)} block max-w-full truncate !px-2.5 sm:!px-3.5`} title={r.label}>
                  {r.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        n > 1 && (
          <div role="tablist" aria-label="3D-кабинеты" className="flex flex-wrap justify-center gap-2">
            {rooms.map((r, i) => (
              <button
                key={r.key}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-controls="room-stage"
                onClick={() => go(i - active)}
                className={tabClass(i === active)}
              >
                {r.label}
              </button>
            ))}
          </div>
        )
      )}

      {/* сцена 4:3; каждая модель вписана со своими пропорциями, чтобы метки (в % картинки) не съезжали */}
      <div
        id="room-stage"
        role="tabpanel"
        aria-label={room.label}
        className="relative aspect-[4/3]"
        style={{ "--dir": dir } as CSSProperties}
      >
        {rooms.map((r, i) => {
          const wide = r.image.width / r.image.height >= STAGE_RATIO;
          return (
            <div
              key={r.key}
              aria-hidden={i !== active}
              className={`absolute inset-0 flex items-center justify-center ${
                i === active
                  ? leaving != null
                    ? "room-in z-10"
                    : ""
                  : i === leaving
                    ? "room-out pointer-events-none"
                    : "pointer-events-none opacity-0"
              }`}
            >
              <div
                className="relative"
                style={{
                  aspectRatio: `${r.image.width} / ${r.image.height}`,
                  ...(wide ? { width: "100%" } : { height: "100%" }),
                }}
              >
                <Image
                  src={r.image.src}
                  alt={r.image.alt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-contain drop-shadow-2xl"
                />
                {/* метки появляются, когда кабинет уже встал на место */}
                {i === active && (
                  <div key={active} className={`absolute inset-0 ${leaving != null ? "room-pins" : ""}`}>
                    {r.pins.map((pin) => (
                      <Pin key={pin.key} pin={pin} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(hasProject || room.categoryHref || projectIds.length > 0) && (
        <div className="flex flex-wrap justify-center gap-3">
          {hasProject && (
            <a
              href={`#project-${room.projectId}`}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition text-sm"
            >
              Смотреть проект
            </a>
          )}
          {room.categoryHref && (
            <Link
              href={room.categoryHref}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition text-sm"
            >
              Мебель в каталоге
            </Link>
          )}
          {!hasProject && projectIds.length > 0 && (
            <a
              href="#projects"
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition text-sm"
            >
              Все проекты
            </a>
          )}
        </div>
      )}
    </div>
  );
}
