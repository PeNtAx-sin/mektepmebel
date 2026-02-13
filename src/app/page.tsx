import { client } from "@/sanity/lib/client";
import ProductFeed from "@/components/ProductFeed"; // Импортируем наш новый компонент

// Тип данных
interface Product {
  _id: string;
  title: string;
  category: string;
  slug: { current: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
  price: number;
}

export default async function Home() {
  // Получаем товары + поле category
  const products = await client.fetch<Product[]>(
    `*[_type == "product"] | order(_createdAt desc)`,
    {},
    { next: { revalidate: 0 } }
  );

  return (
    <main className="min-h-screen bg-white text-black p-6 md:p-8">
      {/* Шапка */}
      <header className="mb-8 flex justify-between items-end">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
          Школьная мебель
        </h1>
        <p className="text-xs font-mono uppercase tracking-widest text-gray-400">
          В наличии 2026
        </p>
      </header>

      {/* Вставляем компонент с табами и передаем ему товары */}
      <ProductFeed products={products} />
      
    </main>
  );
}
