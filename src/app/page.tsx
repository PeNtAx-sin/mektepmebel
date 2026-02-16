



import { client } from "@/sanity/lib/client";
import ProductFeed from "@/components/ProductFeed"; 
import Features from "@/components/Features"; 

// Тип данных
interface Product {
  _id: string;
  title: string;
  category: string;
  slug: { current: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
  price: number;
  priceVat: number; 
}

export default async function Home() {
  // Получаем товары
  const products = await client.fetch<Product[]>(
    `*[_type == "product"] | order(_createdAt desc)`,
    {},
    { next: { revalidate: 0 } }
  );

  // Твой номер для WhatsApp
  const PHONE_NUMBER = "77471719253"; 
  const PHONE_DISPLAY = "+7 (747) 171-92-53";

  return (
    // Основной фон #f6f8f7ff
    <main className="min-h-screen bg-[#f6f8f7ff] text-slate-800 p-6 md:p-8">
      
      {/* Шапка */}
      <header className="mb-10 border-b border-[#647582ff]/20 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          
          {/* Левая часть: Заголовок + Большая кнопка */}
          <div className="flex flex-col items-start">
            {/* Заголовок */}
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#647582ff] leading-none">
              Школьная мебель
            </h1>
            <p className="text-sm text-slate-500 mt-2 uppercase tracking-wide font-medium">
              Находимся в Алматы / Доставка по Казахстану
            </p>

            {/* БОЛЬШАЯ КНОПКА WHATSAPP */}
            <a 
              href={`https://wa.me/${PHONE_NUMBER}`} 
              target="_blank"
              className="mt-6 inline-flex items-center gap-3 bg-[#3DC286] text-white px-8 py-4 rounded-2xl text-xl md:text-2xl font-bold uppercase tracking-wider hover:bg-[#3DC286] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {/* Иконка WhatsApp увеличена */}
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              {PHONE_DISPLAY}
            </a>
          </div>
          
          {/* Бейджик с годом (Справа) */}
          <div className="text-right">
            <p className="text-xs font-mono uppercase tracking-widest text-[#047EB2] bg-[#E0F2FE] px-3 py-1 rounded">
              В наличии 2026
            </p>
          </div>
        </div>
      </header>

      {/* Секция преимуществ */}
      <Features />

      {/* Каталог товаров */}
      <ProductFeed products={products} />
      
    </main>
  );
}
