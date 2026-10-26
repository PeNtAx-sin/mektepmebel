import { defineArrayMember, defineField, defineType } from "sanity";
import { slugify } from "../lib/slugify";

export default defineType({
  name: "category",
  title: "Категория",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Название",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Ссылка (slug)",
      type: "slug",
      description: "Часть адреса: /catalog/<slug>. Латиницей, без пробелов.",
      options: { source: "title", maxLength: 96, slugify },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "parent",
      title: "Родительская категория",
      type: "reference",
      to: [{ type: "category" }],
      description: "Оставьте пустым для основной категории.",
      options: { filter: "!defined(parent)" },
    }),
    defineField({
      name: "image",
      title: "Фото для карточки",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "shortDescription",
      title: "Краткое описание (для карточки на главной)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "intro",
      title: "Текст в начале страницы категории",
      type: "text",
      rows: 4,
      description: "100–200 слов: что это за мебель и для кого.",
    }),
    defineField({
      name: "bottomText",
      title: "Текст внизу страницы (SEO)",
      type: "text",
      rows: 8,
      description: "200–400 слов: как выбрать, по росту, по материалу. Абзацы разделяйте пустой строкой.",
    }),
    defineField({
      name: "faq",
      title: "Вопросы и ответы",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "question", title: "Вопрос", type: "string" }),
            defineField({ name: "answer", title: "Ответ", type: "text", rows: 3 }),
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        }),
      ],
    }),
    defineField({
      name: "sortOrder",
      title: "Порядок (меньше — выше)",
      type: "number",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO: заголовок (title)",
      type: "string",
      validation: (rule) => rule.max(70).warning("Лучше не длиннее 60–70 символов"),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO: описание (description)",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(170).warning("Лучше не длиннее 150–160 символов"),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "parent.title", media: "image" },
  },
});