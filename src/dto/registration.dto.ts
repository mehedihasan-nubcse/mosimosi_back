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

export class AddRegistrationDto {
  @IsNotEmpty()
  @IsString()
  phoneNo: string;

  @IsNotEmpty()
  @IsString()
  offerId: string;
}

export class FilterRegistrationDto {
  @IsOptional()
  @IsString()
  phoneNo: string;
}

export class OptionRegistrationDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdateRegistrationDto {
  @IsNotEmpty()
  @IsString()
  phoneNo: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class FilterAndPaginationRegistrationDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterRegistrationDto)
  filter: FilterRegistrationDto;

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

export class CheckRegistrationDto {
  @IsNotEmpty()
  @IsString()
  registrationCode: string;

  @IsNotEmpty()
  @IsNumber()
  subTotal: number;
}
