// Перестройка категорий каталога (одноразово):
//  • «Мебель для кабинетов» → «Парты для химии и физики» (новый slug, старый адрес
//    перенаправляется в next.config.ts);
//  • новые категории «Школьная мебель» и «Спец мебель»;
//  • парты для химии и физики — в свою категорию, остальное из кабинетов — в «Спец мебель»;
//  • порядок категорий в каталоге.
// Категории «Комплекты» и «Детские сады» скрипт НЕ удаляет — только проверяет, что они
// пустые; удалить их нужно в Studio.
//
//   node scripts/restructure-catalog.mjs          — показать, что будет сделано
//   node scripts/restructure-catalog.mjs --apply  — записать (нужен SANITY_API_WRITE_TOKEN)

import { createClient } from "next-sanity";

// Ошибки клиента Sanity содержат весь HTTP-запрос с заголовком Authorization —
// печатаем только текст ошибки, чтобы токен не попал в консоль и логи.
const printError = (err) => {
  console.error(`Ошибка: ${err?.message ?? err}${err?.statusCode ? ` (HTTP ${err.statusCode})` : ""}`);
  process.exit(1);
};
process.on("uncaughtException", printError);
process.on("unhandledRejection", printError);

try {
  process.loadEnvFile(".env.local");
} catch {
  // переменные могут быть заданы в окружении
}

const apply = process.argv.includes("--apply");
if (apply && !process.env.SANITY_API_WRITE_TOKEN) {
  console.error("Нет SANITY_API_WRITE_TOKEN в .env.local — записать в Sanity нельзя.");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-02-12",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// без открытого таймера Node иногда завершается, не дождавшись ответа через прокси
const keepAlive = setInterval(() => {}, 1000);

const LAB_ID = "category-kabinety"; // переименовываемая категория, _id остаётся прежним
const SCHOOL_ID = "category-shkolnaya-mebel";
const SPEC_ID = "category-spec-mebel";
const REMOVED = ["komplekty", "detskie-sady"];

// итоговый порядок основных категорий
const order = [
  ["category-party", 10],
  ["category-stulya", 20],
  [LAB_ID, 30],
  [SCHOOL_ID, 40],
  [SPEC_ID, 50],
];

const isLabDesk = (title) => /хими|физик/i.test(title);

const data = await client.fetch(`{
  "lab": *[_id == $lab][0]{ title, "slug": slug.current },
  "existing": *[_id in [$school, $spec]]._id,
  "products": *[_type == "product"]{ _id, title, "cat": categoryRef._ref },
  "removed": *[_type == "category" && slug.current in $removed]{
    _id, title, "slug": slug.current,
    "products": count(*[_type == "product" && (categoryRef._ref == ^._id || categoryRef->parent._ref == ^._id)]),
    "children": count(*[_type == "category" && parent._ref == ^._id])
  }
}`, { lab: LAB_ID, school: SCHOOL_ID, spec: SPEC_ID, removed: REMOVED });

if (!data.lab) printError(new Error(`Не найдена категория ${LAB_ID}`));

const moves = data.products
  .map((p) => {
    const target = isLabDesk(p.title) ? LAB_ID : p.cat === LAB_ID ? SPEC_ID : null;
    return target && target !== p.cat ? { ...p, target } : null;
  })
  .filter(Boolean);

const name = { [LAB_ID]: "Парты для химии и физики", [SPEC_ID]: "Спец мебель" };

console.log(`Переименовать: «${data.lab.title}» (/${data.lab.slug}) → «Парты для химии и физики» (/party-dlya-himii-i-fiziki)`);
for (const [id, title, slug] of [
  [SCHOOL_ID, "Школьная мебель", "shkolnaya-mebel"],
  [SPEC_ID, "Спец мебель", "spec-mebel"],
]) {
  console.log(data.existing.includes(id) ? `Уже есть: ${title}` : `Создать: «${title}» (/${slug})`);
}
console.log(`Перенести товаров: ${moves.length}`);
moves.forEach((m) => console.log(`  → ${m.title.trim()} → ${name[m.target]}`));
console.log(`Порядок: ${order.map(([id, n]) => `${id.replace("category-", "")}=${n}`).join(", ")}`);
console.log("\nУдалить вручную в Studio:");
data.removed.forEach((c) =>
  console.log(`  ✕ «${c.title}» (/${c.slug}) — товаров: ${c.products}, подкатегорий: ${c.children}${c.products || c.children ? "  ⚠ сначала перенесите" : ""}`),
);

if (!apply) {
  console.log("\nПробный запуск, ничего не записано. Добавьте --apply.");
  clearInterval(keepAlive);
  process.exit(0);
}

const tx = client.transaction();
tx.patch(LAB_ID, (p) =>
  p.set({
    title: "Парты для химии и физики",
    slug: { _type: "slug", current: "party-dlya-himii-i-fiziki" },
  }),
);
tx.createIfNotExists({
  _id: SCHOOL_ID,
  _type: "category",
  title: "Школьная мебель",
  slug: { _type: "slug", current: "shkolnaya-mebel" },
});
tx.createIfNotExists({
  _id: SPEC_ID,
  _type: "category",
  title: "Спец мебель",
  slug: { _type: "slug", current: "spec-mebel" },
});
for (const [id, sortOrder] of order) tx.patch(id, (p) => p.set({ sortOrder }));
for (const m of moves) {
  tx.patch(m._id, (p) => p.set({ categoryRef: { _type: "reference", _ref: m.target } }));
}

await tx.commit();
clearInterval(keepAlive);
console.log("\nГотово. Теперь удалите в Studio категории из списка выше.");
