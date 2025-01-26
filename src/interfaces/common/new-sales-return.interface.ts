import { Customer } from './customer.interface';

export interface NewSalesReturn {
  _id?: string;
  customer?: Customer;
  soldDate?: string;
  discount?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
