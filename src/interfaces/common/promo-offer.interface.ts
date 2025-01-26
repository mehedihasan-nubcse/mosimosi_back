export interface PromoOffer {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  terms?: string;
  images?: string[];
  startDateTime?: Date;
  endDateTime?: Date;
  isActive?: boolean;
  totalSubmit?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
