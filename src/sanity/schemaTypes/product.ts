import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Мебель',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Категория',
      type: 'string',
      options: {
        list: [
          { title: 'Парты', value: 'parta' },
          { title: 'Стулья', value: 'chair' },
          { title: 'Спец', value: 'spec' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Ссылка (Slug)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Фото',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
        defineField({
      name: 'price',
      title: 'Цена С НДС ',
      type: 'number',
    }),
    defineField({
      name: 'priceVat',
      title: 'Цена без НДС (KZT)',
      type: 'number',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Краткое описание (для карточки товара)',
      type: 'text', // type 'text' дает удобное многострочное поле
      rows: 3, 
    }),
  ],
})

