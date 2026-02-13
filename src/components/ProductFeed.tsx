"use client"; // Это говорит Next.js, что тут есть интерактив (клики)

import { useState } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

// Типы данных
interface Product {
  _id: string;
  title: string;
  category: string; // Новое поле
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
  price: number;
}

export default function ProductFeed({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const PHONE = "77471719253"; // Твой номер

  // Логика фильтрации
  const filteredProducts =
    activeTab === "all"
      ? products
      : products.filter((product) => product.category === activeTab);

  return (
    <div>
      {/* ТАБЫ (Кнопки) */}
      <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-100 pb-4">
        {[
          { label: "Все товары", value: "all" },
          { label: "Парты", value: "parta" },
          { label: "Стулья", value: "chair" },
          { label: "Спец", value: "spec" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${
              activeTab === tab.value
                ? "text-black border-b-2 border-black" // Активный таб
                : "text-gray-400 hover:text-black" // Неактивный таб
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* СЕТКА ТОВАРОВ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-10">
        {filteredProducts.map((product) => (
          <div key={product._id} className="group cursor-pointer">
            <div className="relative aspect-square w-full bg-white border border-gray-100 mb-3 overflow-hidden p-2">
              {product.image && (
                <Image
                  src={urlFor(product.image).url()}
                  alt={product.title}
                  fill
                  className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
            </div>

            <div className="flex flex-col gap-1 text-center md:text-left">
              <h2 className="text-sm font-bold uppercase tracking-wide leading-tight">
                {product.title}
              </h2>
              {product.price && (
                <span className="text-sm font-mono text-gray-600">
                  {product.price.toLocaleString()} ₸
                </span>
              )}
            </div>

            <a
              href={`https://wa.me/${PHONE}?text=Здравствуйте, меня интересует ${product.title}`}
              target="_blank"
              className="mt-3 block w-full border border-black py-2 text-center text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
            >
              Связаться
            </a>
          </div>
        ))}
      </div>
      
      {/* Если товаров в категории нет */}
      {filteredProducts.length === 0 && (
        <p className="text-gray-400 text-sm uppercase tracking-widest py-10 text-center">
          В этой категории пока пусто
        </p>
      )}
    </div>
  );
}
