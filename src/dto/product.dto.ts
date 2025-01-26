import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

export class AddProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  category?: any;

  @IsOptional()
  imei?: any;
  @IsOptional()
  salesman?: any;

  @IsOptional()
  colors: any;

  @IsOptional()
  note: any;

  @IsOptional()
  sizes: any;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  subcategory?: any;

  @IsOptional()
  productId?: any;

  others?: any;
  @IsOptional()
  model?: any;

  @IsOptional()
  soldQuantity?: number;
  @IsNotEmpty()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsString()
  createTime?: string;

  @IsOptional()
  vendor?: any;

  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  createdAtString?: string;

  @IsOptional()
  @IsString()
  dateString?: string;

  @IsOptional()
  brand?: any;

  @IsOptional()
  unit?: any;
}

export class FilterCProductDto {
  @IsOptional()
  @IsString()
  name: string;
}

export class OptionProductDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  salesman: string;

  @IsOptional()
  @IsString()
  createdAtString: string;

  @IsOptional()
  @IsString()
  createTime?: string;

  @IsOptional()
  colors: any;

  @IsOptional()
  sizes: any;

  @IsOptional()
  @IsString()
  others: string;

  @IsOptional()
  @IsString()
  imei: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  productCode: string;

  @IsOptional()
  @IsNumber()
  salePrice: number;

  @IsOptional()
  @IsNumber()
  purchasePrice: number;

  @IsOptional()
  @IsNumber()
  newQuantity: number;

  @IsOptional()
  category?: any;

  @IsOptional()
  subcategory?: any;

  @IsOptional()
  productId?: any;

  @IsOptional()
  brand?: any;

  @IsOptional()
  unit?: any;

  @IsOptional()
  note?: string;

  @IsOptional()
  @IsString()
  dateString?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];

}

export class FilterAndPaginationProductDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterCProductDto)
  filter: FilterCProductDto;

  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;

  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  sort: object;

  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  select: any;
}
