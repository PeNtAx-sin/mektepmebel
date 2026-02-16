
"use client";

import { useState } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface Product {
  _id: string;
  title: string;
  category: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
  price: number;     
  priceVat: number;  
}

export default function ProductFeed({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const PHONE = "77471719253"; 

  const filteredProducts =
    activeTab === "all"
      ? products
      : products.filter((product) => product.category === activeTab);

  return (
    <div>
      {/* ТАБЫ */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { label: "Все товары", value: "all" },
          { label: "Парты", value: "parta" },
          { label: "Стулья", value: "chair" },
          { label: "Спец", value: "spec" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            // Логика цвета табов
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.value
                ? "bg-[#58B1EC] text-white shadow-md" // Активный: Синий фон
                : "bg-white text-slate-500 border border-[#E0F2FE] hover:bg-[#E0F2FE] hover:text-[#047EB2]" // Обычный
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* СЕТКА ТОВАРОВ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 gap-y-10">
        {filteredProducts.map((product) => (
          <div key={product._id} className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl p-4 border border-[#E0F2FE] hover:shadow-lg transition-shadow duration-300">
            
            {/* Картинка: 30% ЦВЕТА (Голубой фон) */}
            <div className="relative aspect-square w-full bg-[#FFFFF] rounded-xl mb-4 overflow-hidden p-4">
              {product.image && (
                <Image
                  src={urlFor(product.image).url()}
                  alt={product.title}
                  fill
                  className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
            </div>

            {/* Название */}
            <h2 className="text-sm font-bold uppercase tracking-wide leading-tight mb-3 text-slate-800 min-h-[40px]">
              {product.title}
            </h2>

            {/* БЛОК ЦЕН */}
            <div className="mt-auto space-y-2 mb-4">
              
              {/* Секция 1: Без НДС (Вторичный стиль) */}
              {product.price && (
                <div className="flex justify-between items-center border border-[#E0F2FE] px-3 py-2 rounded-lg bg-[#F4FBF6]">
                  <span className="text-[10px] font-bold uppercase text-[#031721]" >
                    C НДС
                  </span>
                  <span className="text-sm font-bold text-[#031721]">
                    {product.price.toLocaleString()} ₸
                  </span>
                </div>
              )}

              {/* Секция 2: С НДС (Акцентный стиль) */}
              {product.priceVat && (
                <div className="flex justify-between items-center bg-[#C4EBF3] px-3 py-2 rounded-lg text-white shadow-md">
                  <span className="text-[10px] font-bold uppercase text-[#031721]">
                    без НДС
                  </span>
                  <span className="text-sm font-bold uppercase text-[#031721]">
                    {product.priceVat.toLocaleString()} ₸
                  </span>
                </div>
              )}
            </div>

            {/* Кнопка заказа */}
            <a
              href={`https://wa.me/${PHONE}?text=Здравствуйте, интересует ${product.title}`}
              target="_blank"
              // Акцентная кнопка, но прозрачная с синей рамкой для легкости
              className="block w-full border-2 border-[#58b1ec] text-[#047EB2] py-3 text-center text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#58b1ec] hover:text-white transition-colors"
            >
              Заказать
            </a>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-slate-400 text-sm uppercase tracking-widest py-10 text-center">
          В этой категории пока пусто
        </p>
      )}
    </div>
  );
}
