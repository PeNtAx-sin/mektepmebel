# Проект: сайт-каталог школьной мебели (Mektep Mebel, mektepmebel.kz)

## Стек
Next.js 16 (App Router, папка src/), React 19, Tailwind CSS v4 (цвета в
src/app/globals.css через @theme), Sanity (next-sanity), Supabase, Recharts.
Импорт "@/..." = src/.

## Структура
- src/app/(site)/ — публичный сайт; шапка, подвал и смета в (site)/layout.tsx.
  Папка (site) в адрес не входит.
- src/app/admin и src/app/studio — CRM и Sanity Studio. Не менять без прямой просьбы.
- src/lib/data.ts — все запросы к Sanity (GROQ). src/lib/site.ts — контакты и меню.
- src/components/cart — смета (localStorage) и окна запроса КП (через WhatsApp).
- src/components/CalculatorModal.tsx — логику расчётов и данные НЕ менять.

## Правила
- Тексты сайта на русском, валюта — тенге (₸).
- В Next 16 params и searchParams — Promise: `const { slug } = await params`.
- Иконки Font Awesome (<i className="fa-solid ...">), картинки через next/image.
- На каждой публичной странице: metadata (title, description, canonical), один h1.
- Не выдумывать факты о компании (сертификаты, годы, отзывы, рейтинги). Нет данных —
  оставить TODO и перечислить в конце ответа.
- Никогда не читать и не выводить .env.local.

## Команды
- npm run dev — запуск; npm run build — проверка сборки. После правок запускать build.

## Категории Sanity (slug)
party (родитель для odnomestnye-party, dvuhmestnye-party, reguliruemye-party),
stulya, komplekty, kabinety, detskie-sady.