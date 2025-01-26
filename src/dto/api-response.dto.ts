
import { IsBoolean, IsOptional } from 'class-validator';

export class OptionPayloadDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}
