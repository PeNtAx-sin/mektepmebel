'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema: {
    ...schema,
    // «Создать» внутри категории в «Товары по категориям» сразу подставляет её
    templates: (prev) => [
      ...prev,
      {
        id: 'product-in-category',
        title: 'Товар в категории',
        schemaType: 'product',
        parameters: [{name: 'categoryId', type: 'string'}],
        value: ({categoryId}: {categoryId: string}) => ({
          categoryRef: {_type: 'reference', _ref: categoryId},
        }),
      },
    ],
  },
  document: {
    // «Главная страница» — один документ, открывается из меню; второй создать нельзя
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== 'homePage'),
    actions: (prev, {schemaType}) =>
      schemaType === 'homePage'
        ? prev.filter(({action}) => action !== 'delete' && action !== 'duplicate' && action !== 'unpublish')
        : prev,
  },
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
