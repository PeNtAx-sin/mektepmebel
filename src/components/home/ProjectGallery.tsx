"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProjectPhoto } from "@/lib/data";

/** Фото одного проекта: стрелки и точки, без автопрокрутки */
export default function ProjectGallery({
  photos,
  isVisualization,
}: {
  photos: ProjectPhoto[];
  isVisualization: boolean;
}) {
  const [active, setActive] = useState(0);
  const count = photos.length;
  const go = (step: number) => setActive((i) => (i + step + count) % count);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
      {photos.map((photo, i) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          style={{ objectPosition: photo.position }}
          className={`object-cover transition-opacity duration-500 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== active}
        />
      ))}

      {isVisualization && (
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">
          Визуализация
        </span>
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Предыдущее фото"
            className="absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <i className="fa-solid fa-chevron-left text-sm" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Следующее фото"
            className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <i className="fa-solid fa-chevron-right text-sm" />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {photos.map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Фото ${i + 1} из ${count}`}
                aria-current={i === active}
                className={`h-2 rounded-full shadow transition-all ${
                  i === active ? "w-5 bg-white" : "w-2 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
