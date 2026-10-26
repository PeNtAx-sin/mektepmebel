import { defineArrayMember, defineField, defineType } from "sanity";
import { slugify } from "../lib/slugify";

export default defineType({
  name: "product",
  title: "Мебель",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Название",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categoryRef",
      title: "Категория",
      type: "reference",
      to: [{ type: "category" }],
      description: "Для подкатегорий выбирайте именно подкатегорию (например, «Парта одноместная»).",
      validation: (rule) =>
        rule.custom((value, context) =>
          value || context.document?.category ? true : "Выберите категорию",
        ),
    }),
    defineField({
      name: "category",
      title: "Категория (устаревшее поле)",
      type: "string",
      description: "Старое поле. Если заполнена «Категория» выше, она имеет приоритет.",
      options: {
        list: [
          { title: "Парты", value: "parta" },
          { title: "Стулья", value: "chair" },
          { title: "Спец", value: "spec" },
        ],
      },
      hidden: ({ document }) => !document?.category,
    }),
    defineField({
      name: "slug",
      title: "Ссылка (Slug)",
      type: "slug",
      options: { source: "title", maxLength: 96, slugify },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Фото",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "gallery",
      title: "Дополнительные фото",
      type: "array",
      of: [defineArrayMember({ type: "image", options: { hotspot: true } })],
    }),
    defineField({
      name: "price",
      title: "Цена С НДС ",
      type: "number",
      description: "Оставьте пустым, если цена по запросу.",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "priceVat",
      title: "Цена без НДС (KZT)",
      type: "number",
    }),
    defineField({
      name: "inStock",
      title: "В наличии",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "shortDescription",
      title: "Краткое описание (для карточки товара)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "description",
      title: "Полное описание",
      type: "text",
      rows: 8,
      description: "Уникальное описание товара. Абзацы разделяйте пустой строкой.",
    }),
    defineField({
      name: "specs",
      title: "Характеристики",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Название",
              type: "string",
              description: "Например: Ростовая группа",
            }),
            defineField({
              name: "value",
              title: "Значение",
              type: "string",
              description: "Например: 3–5 (рост 130–175 см)",
            }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
    defineField({
      name: "featured",
      title: "Показать на главной (большая карточка)",
      type: "boolean",
      initialValue: false,
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
    select: { title: "title", subtitle: "categoryRef.title", media: "image" },
  },
});