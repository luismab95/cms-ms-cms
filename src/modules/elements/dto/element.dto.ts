import { ChildrenSchemaI, ElementKindT } from 'cms-lib-database';

export interface ElementCMSI {
  id: number;
  name: string;
  description: string;
  icon: string;
  css: string;
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
