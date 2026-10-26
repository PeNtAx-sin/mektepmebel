"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="rounded-3xl bg-slate-100 h-80 sm:h-96 flex items-center justify-center text-slate-300 text-7xl">
        <i className="fa-solid fa-couch" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-3xl overflow-hidden bg-white h-80 sm:h-96 border border-slate-100">
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1}`}
              className={`relative h-20 rounded-2xl overflow-hidden bg-white border-2 transition ${
                i === active
                  ? "border-school-blue"
                  : "border-slate-200 opacity-80 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="120px" className="object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}