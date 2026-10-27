import { getAllCategories, getProducts } from "@/lib/data";

// Товары для конструктора КП. Лежит под /admin — закрыт тем же паролем (middleware.ts)
export const dynamic = "force-dynamic";

export async function GET() {
  const [products, categories] = await Promise.all([getProducts(), getAllCategories()]);
  const categoryTitle = new Map(categories.map((c) => [c.slug, c.title]));

  return Response.json(
    products.map((p) => ({
      id: p.id,
      title: p.title,
      category: categoryTitle.get(p.categorySlug) ?? "Без категории",
      price: p.price,
      vatIncluded: p.vatIncluded,
      image: p.image,
    })),
  );
}
