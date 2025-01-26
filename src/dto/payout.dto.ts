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

export class AddPayoutDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  bannerImage: string;

  @IsOptional()
  startDateTime: any;

  @IsOptional()
  endDateTime: any;
}

export class FilterPayoutDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  visibility: boolean;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  price: number;
}

export class OptionPayoutDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdatePayoutDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  payoutCode: string;

  @IsOptional()
  @IsString()
  bannerImage: string;

  @IsOptional()
  startDateTime: any;

  @IsOptional()
  endDateTime: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class FilterAndPaginationPayoutDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterPayoutDto)
  filter: FilterPayoutDto;

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

export class CheckPayoutDto {
  @IsOptional()
  @IsString()
  payoutCode: string;

  @IsOptional()
  @IsNumber()
  subTotal: number;
}
