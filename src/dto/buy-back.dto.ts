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

export class AddBuyBackDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  category?: any;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  subcategory?: any;

  @IsOptional()
  buyBackId?: any;

  others?: any;
  @IsOptional()
  model?: any;

  @IsOptional()
  soldQuantity?: number;
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

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

export class FilterCBuyBackDto {
  @IsOptional()
  @IsString()
  name: string;
}

export class OptionBuyBackDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdateBuyBackDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  others: string;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  buyBackCode: string;

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
  buyBackId?: any;

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

export class FilterAndPaginationBuyBackDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterCBuyBackDto)
  filter: FilterCBuyBackDto;

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
