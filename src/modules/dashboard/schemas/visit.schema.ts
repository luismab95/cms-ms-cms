import { Schema } from 'mongoose';

export const VisitDataSchema = new Schema(
  {
    pageId: Number,
    name: String,
    lang: String,
    micrositie: String,
    path: String,
    sitieId: Number,
    createdAt: String,
    visitAt: String,
  },
  { _id: false },
);

export const VisitSchema = new Schema({
  data: {
    type: VisitDataSchema,
    default: {},
  },
});
