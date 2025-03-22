import { IsInt, IsNotEmpty } from 'class-validator';

export interface NotifyI {
  id: number;
  message: string;
  path: string;
  metadata: { [key: string]: any };
  roleId: number;
  readStatus: boolean;
}
