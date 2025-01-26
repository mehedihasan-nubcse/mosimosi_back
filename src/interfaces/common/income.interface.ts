export interface Income {
  _id?: string;
  date?: string;
  dateString?: string;
  month?: number;
  amount?: number;
  incomeFor?: string;
  description?: string;
  images?: [string];
  createdAt?: Date;
  updatedAt?: Date;
}
