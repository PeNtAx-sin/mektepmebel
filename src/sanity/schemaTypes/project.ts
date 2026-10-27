import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "project",
  title: "Проект",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Название",
      type: "string",
      description: "Например: «Кабинет физики, школа-гимназия №…»",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Город / объект",
      type: "string",
      description: "Показывается под названием. Можно оставить пустым.",
    }),
    defineField({
      name: "photos",
      title: "Фото",
      type: "array",
      description:
        "Горизонтальные, 4:3, от 1600 px по ширине. На главной фото обрезаются до 4:3 — важное держите ближе к центру или отметьте кнопкой «Hotspot».",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Что на фото (alt)",
              type: "string",
              description: "Пусто — подставится название проекта.",
            }),
          ],
        }),
      ],
      options: { layout: "grid" },
      validation: (rule) => rule.required().min(1).error("Добавьте хотя бы одно фото"),
    }),
    defineField({
      name: "isVisualization",
      title: "Это визуализация, а не фото с объекта",
      type: "boolean",
      description:
        "Включите для сгенерированных или 3D-изображений — на сайте появится подпись «Визуализация».",
      initialValue: false,
    }),
    defineField({
      name: "products",
      title: "Товары в проекте",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
    }),
    defineField({
      name: "showOnHome",
      title: "Показывать на главной",
      type: "boolean",
      description: "Фото проекта появятся в слайдере на первом экране.",
      initialValue: true,
    }),
    defineField({
      name: "sortOrder",
      title: "Порядок (меньше — раньше)",
      type: "number",
    }),
  ],
  orderings: [
    {
      title: "Порядок",
      name: "sortOrder",
      by: [
        { field: "sortOrder", direction: "asc" },
        { field: "_createdAt", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      location: "location",
      media: "photos.0",
      showOnHome: "showOnHome",
      isVisualization: "isVisualization",
    },
    prepare: ({ title, location, media, showOnHome, isVisualization }) => ({
      title,
      subtitle: [
        location,
        isVisualization ? "визуализация" : null,
        showOnHome ? "на главной" : "скрыт с главной",
      ]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});
