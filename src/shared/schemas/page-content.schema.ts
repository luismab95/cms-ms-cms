import { Schema } from 'mongoose';

const ElementSchema = new Schema(
  {
    uuid: {
      type: String,
    },
    css: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    config: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    text: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false },
);

const ColumnSchema = new Schema(
  {
    uuid: {
      type: String,
    },
    css: {
      type: String,
      default: '',
    },
    config: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    element: {
      type: ElementSchema,
      default: {},
    },
  },
  { _id: false },
);

const RowSchema = new Schema(
  {
    uuid: {
      type: String,
    },
    css: {
      type: String,
      default: '',
    },
    config: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    columns: {
      type: Array,
      of: ColumnSchema,
      default: [],
    },
  },
  { _id: false },
);

export const DataPageElementSchema = new Schema(
  {
    uuid: {
      type: String,
    },
    css: {
      type: String,
      default: '',
    },
    config: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    rows: {
      type: Array,
      of: RowSchema,
      default: [],
    },
  },
  { _id: false },
);

export const PageContentSchema = new Schema({
  data: {
    type: DataPageElementSchema,
    default: [],
  },
});
