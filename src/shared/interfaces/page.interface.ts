import { ElementDataI } from 'src/modules/pages/dto/page.dto';

export interface ElementI {
  uuid: string;
  name: string;
  css: string;
  config: { [key: string]: any };
  text: { [key: string]: any };
  dataText?: ElementDataI[];
}

export interface ColumnI {
  uuid: string;
  css: string;
  config: { [key: string]: any };
  element: ElementI;
}

export interface RowI {
  uuid: string;
  css: string;
  config: { [key: string]: any };
  columns: ColumnI[];
}

export interface SectionI {
  uuid: string;
  css: string;
  config: { [key: string]: any };
  rows: RowI[];
}
