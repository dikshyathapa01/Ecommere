import {
  IsString,
  IsNumber,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class VariantDto {
  @IsString()
  color!: string;
  @IsString()
  size!: string;
  @IsNumber()
  stock!: number;
}
export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name!: string;
  @IsNotEmpty()
  @IsNumber()
  price!: number;
  @IsNotEmpty()
  @IsString()
  description!: string;
  @IsNotEmpty()
  @IsString()
  brand!: string;
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variant!: VariantDto[];
}
