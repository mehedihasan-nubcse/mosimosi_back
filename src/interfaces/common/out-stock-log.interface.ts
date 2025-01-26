export interface OutStockLog {
  _id: string;
  product?: any;
  quantity: number;
  dateString?: string;
  deletedAt?: string;
  deleteYear?: string;
  deleteMonth?: string;
  deleteDateString?: string;
  deletedBy?: string;
  shop?: any;
  month?: number;
  year?: number;
  updateTime?: any;
  category?: any;
  vendor?: any;
  previousQuantity?: number;
  updatedQuantity?: number;
  imei?: any;
  note?: string;
  salesman?: any;
  createTime?: any;
  createdAt?: Date;
  updatedAt?: Date;
  select?: boolean;
}
