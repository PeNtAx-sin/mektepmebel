// Отправка адресов сайта в IndexNow (Яндекс, Bing, Seznam и др.) — поисковики
// узнают о новых и изменённых страницах за минуты, а не дни.
//
//   node scripts/indexnow.mjs                 — все адреса из sitemap.xml живого сайта
//   node scripts/indexnow.mjs /catalog/stulya — только указанные адреса
//
// Ключ — site.indexNowKey в src/lib/site.ts; сайт должен отдавать его по адресу /<ключ>.txt
// (проверьте в браузере после деплоя).

import { readFileSync } from "node:fs";

const SITE = "https://www.mektepmebel.kz";
const key = readFileSync(new URL("../src/lib/site.ts", import.meta.url), "utf8").match(
  /indexNowKey:\s*"([^"]+)"/,
)?.[1];
if (!key) {
  console.error("Не найден indexNowKey в src/lib/site.ts");
  process.exit(1);
}

const keepAlive = setInterval(() => {}, 1000); // fetch через прокси иногда не держит процесс

try {
  let urls = process.argv.slice(2).map((p) => (p.startsWith("http") ? p : `${SITE}${p}`));
  if (urls.length === 0) {
    const xml = await (await fetch(`${SITE}/sitemap.xml`, { signal: AbortSignal.timeout(30000) })).text();
    urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  }
  if (urls.length === 0) throw new Error("В sitemap.xml нет адресов");

  const res = await fetch("https://yandex.com/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE).host, key, keyLocation: `${SITE}/${key}.txt`, urlList: urls }),
    signal: AbortSignal.timeout(30000),
  });
  // 200/202 — принято; 403 — ключ не найден на сайте; 422 — адреса не с этого сайта
  console.log(`IndexNow: ${res.status} ${res.statusText}, отправлено адресов: ${urls.length}`);
  if (!res.ok) console.log(await res.text());
} catch (err) {
  console.error(`Ошибка: ${err?.message ?? err}`);
  process.exitCode = 1;
} finally {
  clearInterval(keepAlive);
}
