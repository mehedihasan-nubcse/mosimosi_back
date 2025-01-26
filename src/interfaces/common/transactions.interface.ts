export interface Transactions {
  _id?: string;
  date?: Date;
  dateString?: string;
  vendor?: any;
  payableAmount?: number;
  paidAmount?: number;
  description?: string;
  images?: [string];
  createdAt?: Date;
  updatedAt?: Date;
  select?: boolean;
}
