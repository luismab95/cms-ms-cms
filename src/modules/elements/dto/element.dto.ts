import { ChildrenSchemaI, ElementKindT } from 'cms-lib-database';

export interface ElementCMSI {
  id: number;
  code: string;
  slot: string;
  name: string;
  description: string;
  icon: string;
  css: string;
  style: {
    [key: string]: string;
  };
  config: {
    [key: string]: any;
  };
  text: {
    [key: string]: any;
  };
  status: boolean;
  type: any[];
  kind: ElementKindT;
  childrenSchema: ChildrenSchemaI[];
  childrens: ElementCMSI[];
}
