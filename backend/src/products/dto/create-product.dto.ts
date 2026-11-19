import {
  IsString,
  IsNumber,
  ValidateNested,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class VariantDto {
  @IsString()
  color!: string;
  @IsString()
  size!: string;
  @IsNumber()
  @Type(() => Number)
  stock!: number;
}
export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name!: string;
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  price!: number;
  @IsNotEmpty()
  @IsString()
  description!: string;
  @IsNotEmpty()
  @IsString()
  brand!: string;
  @IsOptional()
  @IsString()
  @IsIn(['electronics', 'cloth', 'phones', 'speakers'])
  category?: string;
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        return parsed;
      } catch {
        return value;
      }
    }
    return value;
  })
  variant!: VariantDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageIds?: string[];
}
