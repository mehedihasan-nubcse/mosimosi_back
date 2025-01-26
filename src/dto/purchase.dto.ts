import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';
import { symlink } from 'fs';

export class AddPurchaseDto {
  @IsNotEmpty()
  @IsString()
  supplier: string;

  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @IsString()
  product: string;
}

export class FilterPurchaseDto {
  @IsOptional()
  @IsString()
  supplier: string;
}

export class OptionPurchaseDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdatePurchaseDto {
  @IsNotEmpty()
  @IsString()
  supplier: string;

  @IsDateString()
  date: Date;

  @IsString()
  product: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class FilterAndPaginationPurchaseDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterPurchaseDto)
  filter: FilterPurchaseDto;

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
