export interface ReferenceI {
  id?: number;
  ref: string;
  status?: boolean;
  languageId: number;
  text: string;
  pageId: number;
}

export interface ReferenceReviewI extends ReferenceI {}
