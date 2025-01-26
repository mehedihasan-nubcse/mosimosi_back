export interface Notes {
  _id?: string;
  date?: string;
  dateString?: string;
  month?: number;
  amount?: number;
  notesFor?: string;
  description?: string;
  images?: [string];
  createdAt?: Date;
  updatedAt?: Date;
}
