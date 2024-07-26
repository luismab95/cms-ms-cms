import { Schema } from 'mongoose';

const NestedObjectSchema = new Schema(
  {
    css: {
      type: String,
      default: '',
    },
    data: {
      type: Array,
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
