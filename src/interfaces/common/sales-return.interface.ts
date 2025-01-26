import { Admin } from '../admin/admin.interface';
import { Product } from './product.interface';

export interface SalesReturn {
  _id?: string;
  salesman?: Admin;
  products?: Product[];
  returnDate?: Date;
  returnDateString?: string;
  subTotal?: number;
  totalPurchasePrice?: number;
  grandTotal?: number;
  month?: number;
  year?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
