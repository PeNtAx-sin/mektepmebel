import { defineArrayMember, defineField, defineType } from "sanity";
import PinPositionInput from "../components/PinPositionInput";

// Один документ с фиксированным _id "homePage" — см. structure.ts
export default defineType({
  name: "homePage",
  title: "Главная страница",
  type: "document",
  fields: [
    defineField({
      name: "roomsTitle",
      title: "Заголовок над 3D-кабинетами",
      type: "string",
      initialValue: "Реализованные проекты по всему Казахстану",
    }),
    defineField({
      name: "rooms",
      title: "3D-кабинеты на первом экране",
      type: "array",
      description:
        "Порядок — перетаскиванием. На сайте вкладки с названиями, кабинеты сменяются сами каждые несколько секунд.",
      of: [
        defineArrayMember({
          type: "object",
          name: "room",
          fields: [
            defineField({
              name: "label",
              title: "Название кабинета",
              type: "string",
              description: "Коротко, для вкладки: «Кабинет химии», «Актовый зал»",
              validation: (rule) => rule.required().max(28).warning("Длинное название не влезет во вкладку"),
            }),
            defineField({
              name: "image",
              title: "3D-модель кабинета",
              type: "image",
              description:
                "PNG с прозрачным фоном, 4:3, от 2000 × 1500 px. Все кабинеты — с одного ракурса и в одном масштабе, без надписей на картинке.",
              fields: [
                defineField({
                  name: "alt",
                  title: "Что на картинке (alt)",
                  type: "string",
                  description: "Пусто — подставится «3D-модель: <название кабинета>».",
                }),
              ],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "project",
              title: "Проект с фото",
              type: "reference",
              to: [{ type: "project" }],
              description: "Кнопка «Смотреть проект» прокрутит к нему в блоке «Готовые проекты».",
            }),
            defineField({
              name: "category",
              title: "Категория каталога",
              type: "reference",
              to: [{ type: "category" }],
              description: "Кнопка «Мебель в каталоге», например «Парты для химии и физики».",
            }),
            defineField({
              name: "pins",
              title: "Метки мебели на модели",
              type: "array",
              description: "Сначала загрузите модель, затем в каждой метке кликните по картинке.",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "pin",
                  fields: [
                    defineField({
                      name: "label",
                      title: "Подпись",
                      type: "string",
                      description: "Например: «Лабораторный стол»",
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: "product",
                      title: "Товар",
                      type: "reference",
                      to: [{ type: "product" }],
                      description: "По клику на метку откроется страница товара. Пусто — просто подпись.",
                    }),
                    defineField({
                      name: "position",
                      title: "Место на модели",
                      type: "object",
                      components: { input: PinPositionInput },
                      fields: [
                        defineField({ name: "x", title: "X, % слева", type: "number", validation: (r) => r.min(0).max(100) }),
                        defineField({ name: "y", title: "Y, % сверху", type: "number", validation: (r) => r.min(0).max(100) }),
                      ],
                      validation: (rule) =>
                        rule.custom((value?: { x?: number; y?: number }) =>
                          value?.x != null && value?.y != null ? true : "Кликните по модели, чтобы поставить метку",
                        ),
                    }),
                  ],
                  preview: {
                    select: { title: "label", product: "product.title", x: "position.x", y: "position.y" },
                    prepare: ({ title, product, x, y }) => ({
                      title,
                      subtitle: [
                        product ?? "без товара",
                        x != null && y != null ? `${Math.round(x)}% × ${Math.round(y)}%` : "не размещена",
                      ].join(" · "),
                    }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "label", media: "image", pins: "pins", project: "project.title" },
            prepare: ({ title, media, pins, project }) => ({
              title,
              subtitle: [`меток: ${pins?.length ?? 0}`, project ? `проект: ${project}` : null]
                .filter(Boolean)
                .join(" · "),
              media,
            }),
          },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Главная страница" }) },
});
