import { TypeElementEnum } from 'lib-database/src/entities/cms/element.entity';

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
  type: TypeElementEnum[];
}
