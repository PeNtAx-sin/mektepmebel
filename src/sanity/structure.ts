import type {StructureResolver} from 'sanity/structure'

const BY_SORT_ORDER = [
  {field: 'sortOrder', direction: 'asc' as const},
  {field: '_createdAt', direction: 'desc' as const},
]

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Каталог')
    .items([
      // Категория → её товары (у основной — вместе с товарами подкатегорий)
      S.listItem()
        .title('Товары по категориям')
        .icon(() => '🗂')
        .child(
          S.documentTypeList('category')
            .title('Категории')
            .defaultOrdering([{field: 'sortOrder', direction: 'asc'}])
            .child((categoryId) =>
              S.documentList()
                .title('Товары')
                .schemaType('product')
                .filter(
                  '_type == "product" && (categoryRef._ref == $id || categoryRef->parent._ref == $id)',
                )
                .params({id: categoryId})
                .defaultOrdering(BY_SORT_ORDER)
                .initialValueTemplates([
                  S.initialValueTemplateItem('product-in-category', {categoryId}),
                ]),
            ),
        ),
      S.listItem()
        .title('Товары без категории')
        .icon(() => '⚠️')
        .child(
          S.documentList()
            .title('Без категории')
            .schemaType('product')
            .filter('_type == "product" && !defined(categoryRef)')
            .defaultOrdering(BY_SORT_ORDER),
        ),
      S.divider(),
      S.documentTypeListItem('product').title('Все товары'),
      S.documentTypeListItem('category').title('Категории'),
      S.divider(),
      S.documentTypeListItem('project').title('Проекты (слайдер на главной)'),
    ])
