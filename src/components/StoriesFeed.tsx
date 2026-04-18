"use client";

import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface Product {
  _id: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
}

export default function StoriesFeed({ products }: { products: Product[] }) {
  // Берем первые 8 товаров, чтобы показать их как "Новинки"
  const storyProducts = products.slice(0, 20);

  return (
    <div className="mb-10 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-[#58B1EC] animate-pulse"></div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Новинки и Популярное
        </h3>
      </div>
      
      {/* Контейнер со скроллом */}
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar relative">
        
        {/* CSS для скрытия стандартного скроллбара, чтобы выглядело как в Инстаграм */}
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {storyProducts.map((product) => (
          // Мини-карточка (Story)
          <div 
            key={product._id} 
            className="relative min-w-[120px] h-[160px] md:min-w-[140px] md:h-[180px] rounded-2xl p-[2px] bg-gradient-to-br from-[#58B1EC] to-[#C4EBF3] snap-start cursor-pointer group flex-shrink-0 shadow-sm hover:shadow-md transition-all"
          >
            <div className="relative w-full h-full bg-white rounded-[14px] overflow-hidden flex flex-col p-2">
              
              {/* Место под фото */}
              <div className="relative flex-1 w-full bg-[#fffff] rounded-lg overflow-hidden">
                {product.image && (
                  <Image 
                    src={urlFor(product.image).url()} 
                    alt={product.title} 
                    fill 
                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                  />
                )}
              </div>

              {/* Название */}
              <div className="mt-2 h-8 flex items-center justify-center">
                <p className="text-[9px] md:text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight text-center uppercase">
                  {product.title}
                </p>
              </div>
            </div>

            {/* Маленький бейджик "NEW" */}
            <div className="absolute -top-2 -right-2 bg-[#047EB2] text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-sm z-10 border-2 border-white">
              New
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}