# План

## Сделано
- [x] Главная, каркас (шапка, подвал), смета и запрос КП
- [x] Схемы Sanity (category, product), слой данных src/lib/data.ts
- [x] Каталог, страницы категорий и товаров
- [x] Меню шапки и подвала из Sanity (getCatalogMenu), ссылки на несуществующие страницы убраны
- [x] Категории созданы в Sanity, товары привязаны, slug исправлены
- [x] Каталог: картинки через CDN Sanity (imageLoader) с кадрированием, цена с/без НДС, alt
- [x] Studio: вкладки и подсказки в товаре, проверка slug, «Товары по категориям»
- [x] Главная: витрина 3D-кабинетов с метками мебели (Studio → «Главная страница») и блок «Готовые проекты»
- [x] Общий каталог /catalog разделами по категориям; редиректы со старых адресов категорий
- [x] SEO: title ≤60 / description ≤160 и OpenGraph на всех страницах (lib/seo.ts), картинка для соцсетей
  (opengraph-image.tsx), sitemap из Sanity с фото, robots, разметка Organization/WebSite+SearchAction,
  Product+ImageObject, ItemList, FAQPage, BreadcrumbList, BlogPosting; тексты категорий по умолчанию
  (lib/seo-content.ts), перелинковка, поиск /search, 404, nofollow на внешних ссылках
- [x] Страница «Пластиковые стулья для дома и кафе» (/plastikovye-stulya), блог /blog (тип article в Sanity)
- [x] Счётчики Метрики и GA4 (components/Analytics.tsx, по переменным окружения), IndexNow (scripts/indexnow.mjs)

## Осталось
- [ ] Проверить сборку (npm run build), картинки Sanity, переходы по всем ссылкам
- [ ] Отозвать токен на запись в sanity.io/manage и удалить SANITY_API_WRITE_TOKEN из .env.local
- [ ] Сгенерировать 3D-кабинеты, загрузить и расставить метки: Studio → «Главная страница»
- [ ] Заполнить в Studio краткие описания, описания и характеристики товаров (сейчас пусто у всех)
- [ ] Разнести 10 парт из «Школьные парты» по подкатегориям в Studio; заполнить фото, тексты и SEO категорий
- [ ] Страницы (вернуть в mainNav в site.ts и карточку на главной): /dlya-shkol, /dostavka-i-oplata, /o-kompanii, /kontakty
- [ ] SEO: номера Метрики и GA4 в переменные окружения; проверить контакты и включить LocalBusiness
  (site.contactsVerified); разные названия у одинаковых товаров («Стул на 4 ножках» ×4, «Стул для актового зала» ×2);
  опубликовать статьи (node scripts/seed-articles.mjs --apply → Studio → Publish); после деплоя — sitemap в
  Вебмастер и Search Console, node scripts/indexnow.mjs
- [ ] Заявки (смета и КП) сохранять в Supabase
- [ ] Реальные данные: телефон, WhatsApp, адрес, гарантия, сертификаты (site.ts, главная)