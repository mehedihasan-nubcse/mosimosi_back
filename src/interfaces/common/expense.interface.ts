export interface Expense {
  _id?: string;
  date?: string;
  dateString?: string;
  month?: number;
  amount?: number;
  expenseFor?: string;
  description?: string;
  images?: [string];
  createdAt?: Date;
  updatedAt?: Date;
}
