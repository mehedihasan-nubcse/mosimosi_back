import { Customer } from './customer.interface';
import { Product } from './product.interface';

export interface Sales {
  _id?: string;
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
