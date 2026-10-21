export interface NotifyI {
  id?: number;
  message: string;
  metadata: {
    [key: string]: any;
  };
  readStatus: boolean;
  userId: number;
  createdAt?: Date;
}
