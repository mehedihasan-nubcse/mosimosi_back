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

export class AddPresaleProductDto {
  @IsNotEmpty()
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

export class FilterCPresaleProductDto {
  @IsOptional()
  @IsString()
  name: string;
}

export class OptionPresaleProductDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdatePresaleProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  others: string;

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
  @IsString()
  dateString?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class FilterAndPaginationPresaleProductDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterCPresaleProductDto)
  filter: FilterCPresaleProductDto;

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
