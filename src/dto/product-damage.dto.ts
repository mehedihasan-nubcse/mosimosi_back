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
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

export class AddProductDamageDto {
  @IsOptional()
  @IsDateString()
  date: Date;

  @IsOptional()
  name: string;

  @IsOptional()
  @IsString()
  sku: string;


  @IsOptional()
  colors: any;

  @IsOptional()
  sizes: any;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  product: any;
}

export class FilterProductDamageDto {
  @IsOptional()
  @IsDateString()
  date: Date;
}

export class OptionProductDamageDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdateProductDamageDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class FilterAndPaginationProductDamageDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterProductDamageDto)
  filter: FilterProductDamageDto;

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
