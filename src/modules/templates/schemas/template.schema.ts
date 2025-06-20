import { Schema } from 'mongoose';
import { DataPageElementSchema } from 'src/shared/schemas/page-content.schema';

const NestedObjectSchema = new Schema(
  {
    css: {
      type: String,
      default: '',
    },
    data: {
      type: Array,
      of: DataPageElementSchema,
      default: [],
    },
    config: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false },
);

export const TemplateObjectSchema = new Schema(
  {
    header: {
      type: NestedObjectSchema,
      default: {},
    },
    footer: {
      type: NestedObjectSchema,
      default: {},
    },
  },
  { _id: false },
);

export const TemplateSchema = new Schema({
  data: {
    type: TemplateObjectSchema,
    default: {},
  },
});
