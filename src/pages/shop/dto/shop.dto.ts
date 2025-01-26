import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';


import { OptionPayloadDto } from 'src/dto/api-response.dto';
import { PaginationDto } from 'src/dto/pagination.dto';

export class CheckShopAvailabilityDto {
  @IsNotEmpty()
  @IsString()
  slug: string;
}

export class AddShopDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  subDomain: string;

  @IsOptional()
  @IsString()
  theme: string;
}

export class InsertManyShopDto {
  @Type(() => AddShopDto)
  data: AddShopDto[];
  option: OptionPayloadDto;
}

export class FilterShopDto {
  @IsOptional()
  @IsString()
  status?: 'draft' | 'publish';
}

export class UpdateShopDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  pageName: string;

  @IsOptional()
  @IsString()
  shopDescription: string;

  @IsOptional()
  @IsString()
  keyWord: string;

  @IsOptional()
  @IsString()
  buildStatus: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class FilterAndPaginationShopDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterShopDto)
  filter: FilterShopDto;

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
