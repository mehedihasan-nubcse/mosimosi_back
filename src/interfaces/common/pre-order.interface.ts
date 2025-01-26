import { Customer } from './customer.interface';

export interface PreOrder {
  _id?: string;
  customer?: Customer;
  date?: string;
  referenceNo?: string;
  discount?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
