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

export class AddTransactionsDto {
  @IsNotEmpty()
  date: Date;

  @IsOptional()
  vendorId: any;

  @IsOptional()
  @IsNumber()
  payableAmount: number;

  @IsOptional()
  @IsNumber()
  paidAmount: number;
}

export class FilterTransactionsDto {
  @IsOptional()
  transactionDateString: Date;
}

export class OptionTransactionsDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdateTransactionsDto {

  @IsOptional()
  @IsNumber()
  payableAmount: number;

  @IsOptional()
  @IsNumber()
  paidAmount: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class FilterAndPaginationTransactionsDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterTransactionsDto)
  filter: FilterTransactionsDto;

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
