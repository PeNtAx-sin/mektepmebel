import { getProducts } from "@/lib/data";
import { buildOfferDocx } from "@/lib/offer-docx";

// Собирает коммерческое предложение в .docx. Закрыт паролем админки (middleware.ts)
export const dynamic = "force-dynamic";

type Body = {
  date?: unknown;
  company?: unknown;
  vatIncluded?: unknown;
  items?: { productId?: unknown; price?: unknown; quantity?: unknown }[];
};

const bad = (message: string) => Response.json({ error: message }, { status: 400 });

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return bad("Пустой запрос");

  const company = typeof body.company === "string" ? body.company.trim().slice(0, 200) : "";
  const date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : "";
  if (!company) return bad("Укажите компанию");
  if (!date) return bad("Укажите дату");
  if (!Array.isArray(body.items) || body.items.length === 0) return bad("Добавьте хотя бы одну позицию");
  if (body.items.length > 100) return bad("Слишком много позиций");

  // название и фото берём из каталога, цену и количество — из формы
  const products = new Map((await getProducts()).map((p) => [p.id, p]));
  const lines = [];
  for (const item of body.items) {
    const product = typeof item.productId === "string" ? products.get(item.productId) : undefined;
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    if (!product) return bad("Товар не найден в каталоге — обновите страницу");
    if (!Number.isFinite(price) || price < 0) return bad(`Неверная цена: ${product.title}`);
    if (!Number.isInteger(quantity) || quantity < 1) return bad(`Неверное количество: ${product.title}`);
    lines.push({ title: product.title, image: product.image, price, quantity });
  }

  const file = await buildOfferDocx({ date, company, vatIncluded: body.vatIncluded !== false, lines });
  const name = `КП ${company.replace(/[\\/:*?"<>|]+/g, " ")} ${date}.docx`;

  return new Response(new Uint8Array(file), {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "content-disposition": `attachment; filename="kp-${date}.docx"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "cache-control": "no-store",
    },
  });
}
