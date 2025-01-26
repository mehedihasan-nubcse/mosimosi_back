export interface Vendor {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  alternateNumber?: string;
  image?: string;
  totalPaid?: number;
  totalPayable?: number;
  createdAt?: Date;
  updatedAt?: Date;
  select?: boolean;
  dueAmount?: number;
  paidAmount?: number;
}
