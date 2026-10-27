import { defineArrayMember, defineField, defineType } from "sanity";
import { checkSlug, slugify } from "../lib/slugify";

const formatPrice = (n?: number) => (n != null ? `${n.toLocaleString("ru-RU")} ₸` : null);

export default defineType({
  name: "product",
  title: "Мебель",
  type: "document",
  groups: [
    { name: "main", title: "Основное", default: true },
    { name: "media", title: "Фото" },
    { name: "content", title: "Описание" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Название",
      type: "string",
      group: "main",
      validation: (rule) => [
        rule.required(),
        rule
          .custom((value?: string) =>
            value && value !== value.trim() ? "Уберите пробелы в начале или в конце" : true,
          )
          .warning(),
      ],
    }),
    defineField({
      name: "slug",
      title: "Адрес страницы (slug)",
      type: "slug",
      group: "main",
      description: "Часть адреса: /catalog/<категория>/<slug>. Нажмите «Generate».",
      options: { source: "title", maxLength: 96, slugify },
      validation: (rule) => rule.required().custom(checkSlug),
    }),
    defineField({
      name: "categoryRef",
      title: "Категория",
      type: "reference",
      group: "main",
      to: [{ type: "category" }],
      description:
        "Для парт выбирайте подкатегорию (например, «Парта одноместная») — товар появится и в ней, и в «Школьных партах».",
      validation: (rule) => rule.required().error("Выберите категорию — без неё товара нет в каталоге"),
    }),
    defineField({
      name: "price",
      title: "Цена с НДС, ₸",
      type: "number",
      group: "main",
      description: "Показывается на сайте с подписью «с НДС». Заполните её или цену без НДС.",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "priceVat",
      title: "Цена без НДС, ₸",
      type: "number",
      group: "main",
      description:
        "Показывается на сайте с подписью «без НДС», только если цена с НДС пустая. Обе пустые — «Цена по запросу».",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "inStock",
      title: "В наличии",
      type: "boolean",
      group: "main",
      description: "Выключите — на сайте будет «Под заказ».",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Показать на главной (большая карточка)",
      type: "boolean",
      group: "main",
      description: "Карточка видна на первом экране, только пока нет проектов для слайдера.",
      initialValue: false,
    }),
    defineField({
      name: "sortOrder",
      title: "Порядок в каталоге",
      type: "number",
      group: "main",
      description: "Меньше — выше. Без номера товар идёт после пронумерованных, новые первыми.",
    }),
    defineField({
      name: "image",
      title: "Главное фото",
      type: "image",
      group: "media",
      description:
        "Лучше квадратное, от 1000×1000, на светлом фоне. Кнопкой «Crop» можно обрезать края — сайт это учитывает.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Подпись к фото (alt)",
          type: "string",
          description: "Что на фото, для поисковиков. Пусто — подставится название товара.",
        }),
      ],
      validation: (rule) => rule.required().warning("Без фото карточка в каталоге будет пустой"),
    }),
    defineField({
      name: "gallery",
      title: "Дополнительные фото",
      type: "array",
      group: "media",
      of: [defineArrayMember({ type: "image", options: { hotspot: true } })],
      options: { layout: "grid" },
    }),
    defineField({
      name: "shortDescription",
      title: "Краткое описание",
      type: "text",
      group: "content",
      rows: 3,
      description: "1–2 предложения: показывается в карточке каталога и рядом с ценой.",
      validation: (rule) => rule.max(200).warning("В карточке поместится примерно 150–200 символов"),
    }),
    defineField({
      name: "description",
      title: "Полное описание",
      type: "text",
      group: "content",
      rows: 8,
      description: "Уникальное описание товара. Абзацы разделяйте пустой строкой.",
    }),
    defineField({
      name: "specs",
      title: "Характеристики",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Название",
              type: "string",
              description: "Например: Ростовая группа",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "value",
              title: "Значение",
              type: "string",
              description: "Например: 3–5 (рост 130–175 см)",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
    defineField({
      name: "seoTitle",
      title: "SEO: заголовок (title)",
      type: "string",
      group: "seo",
      description: "Пусто — «<Название> — купить».",
      validation: (rule) => rule.max(70).warning("Лучше не длиннее 60–70 символов"),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO: описание (description)",
      type: "text",
      group: "seo",
      rows: 3,
      description: "Пусто — берётся краткое описание.",
      validation: (rule) => rule.max(170).warning("Лучше не длиннее 150–160 символов"),
    }),
    // Старое поле: данные остались у товаров, на сайте используется, только если
    // не выбрана «Категория». В форме не показываем.
    defineField({
      name: "category",
      title: "Категория (устаревшее поле)",
      type: "string",
      hidden: true,
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: "Порядок в каталоге",
      name: "sortOrder",
      by: [
        { field: "sortOrder", direction: "asc" },
        { field: "_createdAt", direction: "desc" },
      ],
    },
    { title: "Название", name: "title", by: [{ field: "title", direction: "asc" }] },
    {
      title: "Цена",
      name: "price",
      by: [
        { field: "price", direction: "asc" },
        { field: "priceVat", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      category: "categoryRef.title",
      price: "price",
      priceVat: "priceVat",
      media: "image",
    },
    prepare({ title, category, price, priceVat, media }) {
      const priceText =
        formatPrice(price) ?? (priceVat != null ? `${formatPrice(priceVat)} без НДС` : "цена по запросу");
      return {
        title,
        subtitle: [category ?? "без категории", priceText].join(" · "),
        media,
      };
    },
  },
});
