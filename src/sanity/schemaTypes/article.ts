import { defineArrayMember, defineField, defineType } from "sanity";
import { checkSlug } from "../lib/slugify";

// Статьи для раздела /blog: полезные материалы под поисковые запросы
// («как выбрать парту по росту», «стулья для кафе» и т. п.)
export default defineType({
  name: "article",
  title: "Статья",
  type: "document",
  groups: [
    { name: "main", title: "Основное", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Заголовок (H1)",
      type: "string",
      group: "main",
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: "slug",
      title: "Адрес (slug)",
      type: "slug",
      group: "main",
      description: "Латиницей через дефис: kak-vybrat-partu-po-rostu",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required().custom(checkSlug),
    }),
    defineField({
      name: "publishedAt",
      title: "Дата публикации",
      type: "datetime",
      group: "main",
      description: "Без даты статья не показывается на сайте.",
    }),
    defineField({
      name: "excerpt",
      title: "Анонс",
      type: "text",
      rows: 3,
      group: "main",
      description: "2–3 предложения для списка статей и для поиска (если SEO-описание пустое).",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "cover",
      title: "Обложка",
      type: "image",
      group: "main",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Что на картинке (alt)",
          type: "string",
          description: "Для поиска по картинкам и незрячих посетителей.",
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Текст",
      type: "array",
      group: "main",
      description: "Подзаголовки — H2/H3 (H1 — это заголовок статьи). Ссылки на категории и товары помогают продвижению.",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Обычный", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Цитата", value: "blockquote" },
          ],
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Что на картинке (alt)", type: "string" })],
        }),
      ],
    }),
    defineField({
      name: "categories",
      title: "Связанные категории каталога",
      type: "array",
      group: "main",
      description: "Внизу статьи появятся ссылки «Смотрите в каталоге».",
      of: [defineArrayMember({ type: "reference", to: [{ type: "category" }] })],
    }),
    defineField({
      name: "seoTitle",
      title: "SEO-заголовок",
      type: "string",
      group: "seo",
      description: "До 45 символов (к нему добавится « | Mektep Mebel»). Пусто — заголовок статьи.",
      validation: (rule) => rule.max(45).warning("Длиннее 45 символов — поисковик обрежет"),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO-описание",
      type: "text",
      rows: 3,
      group: "seo",
      description: "До 160 символов. Пусто — анонс.",
      validation: (rule) => rule.max(160).warning("Длиннее 160 символов — поисковик обрежет"),
    }),
  ],
  orderings: [{ title: "Сначала новые", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", date: "publishedAt", media: "cover" },
    prepare: ({ title, date, media }) => ({
      title,
      subtitle: date ? new Date(date).toLocaleDateString("ru-RU") : "черновик — нет даты публикации",
      media,
    }),
  },
});
