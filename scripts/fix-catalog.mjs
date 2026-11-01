// Разовые правки каталога в Sanity для поиска: разные названия у товаров-дублей,
// парты по подкатегориям, заголовок блока на главной. Адреса товаров (slug) не меняются,
// старые адреса с другой категорией сайт перенаправляет сам.
//
//   node scripts/fix-catalog.mjs          — показать, что изменится
//   node scripts/fix-catalog.mjs --apply  — записать (нужен SANITY_API_WRITE_TOKEN)

import { createClient } from "next-sanity";

// Ошибки клиента Sanity содержат заголовок Authorization — печатаем только текст
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

const TITLES = {
  "stul-na-4-nozhkakh-m1-zel": "Стул на 4 ножках Зеленый",
  "stul-na-4-nozhkakh-m1-blue": "Стул на 4 ножках Синий",
  "stul-na-4-nozhkakh-m1-orange": "Стул на 4 ножках Оранжевый",
  "stul-na-4-nozhkakh-m1-grey": "Стул на 4 ножках Серый",
  "stul-shkolnyi-na-4-nozhkakh-sinii": "Стул школьный на Z-образном каркасе Синий",
  "stul-dlya-aktovogo-zala2": "Стул для актового зала Красный",
  "stul-dlya-aktovogo-zala": "Стул для актового зала Синий",
  "stul-dlya-shkoly-na-4-nozhkakh-s-vyrezom-seryi": "Стул для школы на 4 ножках с вырезом Серый",
  "stol-uchitelskii": "Стол учительский",
};

const products = await client.fetch(
  `*[_type == "product" && !(_id in path("drafts.**"))]{ _id, title, "slug": slug.current, "cat": categoryRef->slug.current }`,
);
const home = await client.fetch(`*[_id == "homePage"][0]{ roomsTitle }`);

const tx = client.transaction();
let changes = 0;

for (const p of products) {
  const set = {};
  const title = TITLES[p.slug];
  if (title && p.title.trim() !== title) {
    set.title = title;
    console.log(`Название: «${p.title.trim()}» → «${title}»`);
  }
  const sub = /двухместн/i.test(p.title) ? "dvuhmestnye-party" : /одноместн/i.test(p.title) ? "odnomestnye-party" : null;
  if (sub && p.cat === "party") {
    set.categoryRef = { _type: "reference", _ref: `category-${sub}` };
    console.log(`Категория: «${p.title.trim()}» → ${sub}`);
  }
  if (Object.keys(set).length > 0) {
    tx.patch(p._id, { set });
    changes += 1;
  }
}

if (home && home.roomsTitle !== "Наши проекты") {
  tx.patch("homePage", { set: { roomsTitle: "Наши проекты" } });
  console.log(`Главная: «${home.roomsTitle}» → «Наши проекты»`);
  changes += 1;
}

if (changes === 0) {
  console.log("Всё уже исправлено.");
} else if (apply) {
  await tx.commit();
  console.log(`Записано изменений: ${changes}. На сайте появятся примерно через минуту.`);
} else {
  console.log(`\nИзменений: ${changes}. Чтобы записать: node scripts/fix-catalog.mjs --apply`);
}
