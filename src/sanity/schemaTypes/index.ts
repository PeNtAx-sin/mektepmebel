import { type SchemaTypeDefinition } from "sanity";
import product from "./product";
import category from "./category";
import project from "./project";
import homePage from "./homePage";
import article from "./article";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, category, project, homePage, article],
};