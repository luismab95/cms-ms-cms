import { IsNotEmpty, IsString } from 'class-validator';

export interface DashboardElementsI {
  pages: number;
  microsities: number;
  templates: number;
  files: number;
}

export interface VisitDataMongoI {
  pageId: number;
  name: string;
  lang: string;
  micrositie: string;
  path: string;
  sitieId: number;
  createdAt: string;
  visitAt: string;
}

export interface Top10PagesI {
  _id: { pageId: number; lang: string };
  name: string;
  lang: string;
  micrositie: string;
  path: string;
  visits: number;
}

export interface VisitMongoI extends Document {
  data: VisitDataMongoI;
}

export interface WeekVisitI {
  lastWeek: WeekVisitDataI;
  thisWeek: WeekVisitDataI;
}

export interface WeekVisitDataI {
  sitie: number;
  page: number;
  micrositie: number;
  data: number[];
}

export interface YearVisitI {
  lastYear: YearVisitDataI[];
  thisYear: YearVisitDataI[];
}

export interface YearVisitDataI {
  name: string;
  data: { x: string; y: number }[];
}
