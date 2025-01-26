import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  isString,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';
import { Product } from 'src/interfaces/common/product.interface';

export class AddPreOrderDto {
  @IsOptional()
  customer: any;

  @IsOptional()
  @IsArray()
  products: Product[];

  @IsNotEmpty()
  @IsDateString()
  soldDate: Date;

  @IsNotEmpty()
  @IsNumber()
  discountAmount: number;

  @IsNotEmpty()
  @IsNumber()
  usePoints: number;

  @IsNotEmpty()
  @IsNumber()
  subTotal: number;

  @IsNotEmpty()
  @IsNumber()
  total: number;
}

export class FilterPreOrderDto {
  @IsOptional()
  @IsString()
  customer: string;
}

export class OptionPreOrderDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdatePreOrderDto {
  @IsOptional()
  customer: any;

  @IsDateString()
  soldDate: Date;

  @IsOptional()
  invoiceNo: string;

  @IsOptional()
  @IsArray()
  products: Product[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class FilterAndPaginationPreOrderDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterPreOrderDto)
  filter: FilterPreOrderDto;

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
