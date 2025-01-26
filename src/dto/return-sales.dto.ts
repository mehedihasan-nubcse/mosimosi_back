import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
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
import { Product } from '../interfaces/common/product.interface';

export class AddReturnSalesDto {
  @IsOptional()
  @IsArray()
  products: Product[];

  @IsOptional()
  customer: any;

  @IsOptional()
  @IsNumber()
  grandTotal: any;
}

export class FilterReturnSalesDto {
  @IsOptional()
  @IsString()
  customer: string;
}

export class OptionReturnSalesDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdateReturnSalesDto {
  @IsString()
  customer: string;

  @IsDateString()
  date: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class FilterAndPaginationReturnSalesDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterReturnSalesDto)
  filter: FilterReturnSalesDto;

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
