import { TypeReviewT } from 'cms-lib-database';

export interface ReferenceI {
  id?: number;
  ref: string;
  status?: boolean;
  languageId: number;
  text: string;
  type: TypeReviewT;
  pageId: number | null;
  templateId: number | null;
}

export interface ReferenceReviewI extends ReferenceI {}
