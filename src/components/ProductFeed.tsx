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
  priceVat?: number;
  shortDescription?: string;  
}

export default function ProductFeed({ products }: { products?: Product[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const safeProducts = Array.isArray(products) ? products : [];

  // Фильтрация товаров по вкладкам и поиску
  const filteredProducts = safeProducts.filter((product) => {
    const matchesTab = activeTab === "all" || product.category === activeTab;
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.shortDescription && product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Поиск и табы категорий */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или описанию..." 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-800"
          />
        </div>
        <div className="text-sm font-semibold text-slate-500 whitespace-nowrap">
          Найдено товаров: <span className="text-slate-900 font-black">{filteredProducts.length}</span>
        </div>
      </div>

      {/* Табы */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Все товары", value: "all" },
          { label: "Школьные парты", value: "Школьные парты" },
          { label: "Школьные стулья", value: "Школьные стулья" },
          { label: "Комплекты", value: "Комплекты" },
          { label: "Мебель для кабинетов", value: "Мебель для кабинетов" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.value
                ? "bg-blue-900 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Сетка товаров */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl transition border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="relative aspect-square w-full bg-slate-100 rounded-2xl mb-4 overflow-hidden p-4 flex items-center justify-center">
                {product.image ? (
                  <Image
                    src={urlFor(product.image).url()}
                    alt={product.title}
                    fill
                    className="object-contain transition-transform duration-500 hover:scale-105 p-2"
                  />
                ) : (
                  <span className="text-xs text-slate-400 font-bold">Mektep Mebel</span>
                )}
              </div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">{product.category}</span>
              <h3 className="font-bold text-slate-900 mt-1 mb-2 leading-snug">{product.title}</h3>
              {product.shortDescription && (
                <p className="text-slate-500 text-xs line-clamp-2 mb-4">{product.shortDescription}</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Цена по ГОСТу</span>
                <span className="text-lg font-black text-slate-900">
                  {product.price ? `${product.price.toLocaleString('ru-RU')} ₸` : 'По запросу'}
                </span>
              </div>
              <a
                href={`https://wa.me/77471719253?text=Здравствуйте, интересует товар: ${product.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase transition shadow"
              >
                Заказать
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-16 text-center text-slate-400 text-sm uppercase tracking-widest">
          В этой категории товаров пока не найдено
        </div>
      )}
    </div>
  );
}