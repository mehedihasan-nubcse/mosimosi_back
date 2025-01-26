import { Customer } from './customer.interface';
import { Product } from './product.interface';

export interface SalesLog {
  _id?: string;
  deletedAt?: string;
  deleteYear?: string;
  deleteMonth?: string;
  deleteDateString?: string;
  deletedBy?: string;
  customer?: Customer;
  date?: string;
  month: number;
  year: number;
  referenceNo?: string;
  discount?: number;
  vatAmount?: number;
  status?: string;
  totalPurchasePrice: number;
  createdAt?: Date;
  updatedAt?: Date;
  products: [Product];
}
