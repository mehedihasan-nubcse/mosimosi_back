import { Category } from './category.interface';
import { SubCategory } from './sub-category.interface';
import { Brand } from './brand.interface';
import { Unit } from './unit.interface';

export interface BuyBack {
  _id?: string;
  name?: string;
  category?: Category;
  subcategory?: SubCategory;
  brand?: Brand;
  unit?: Unit;
  sku?: string;
  others?: string;
  model?: string;
  quantity?: number;
  description?: string;
  purchasePrice?: number;
  salePrice?: number;
  status?: boolean;
  soldQuantity?: number;
  images?: [string];
  createdAtString: string;
  updatedAtString: string;
  saleType: 'Return' | 'Sale';
  createdAt?: Date;
  updatedAt?: Date;
}
