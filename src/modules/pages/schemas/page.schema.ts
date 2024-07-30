import { Schema } from 'mongoose';
import { DataPageElementSchema } from 'src/shared/schemas/page-content.schema';

const BodyObjectSchema = new Schema(
  {
    css: {
      type: String,
      default: '',
    },
    config: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    data: {
      type: Array,
      of: DataPageElementSchema,
      default: [],
    },
  },
  { _id: false },
);

export const PageDataSchema = new Schema(
  {
    body: {
      type: BodyObjectSchema,
      default: {},
    },
  },
  { _id: false },
);

export const PageSchema = new Schema({
  data: {
    type: PageDataSchema,
    default: {},
  },
});
