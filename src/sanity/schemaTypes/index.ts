import { type SchemaTypeDefinition } from "sanity";
import product from "./product";
import category from "./category";
import project from "./project";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, category, project],
};