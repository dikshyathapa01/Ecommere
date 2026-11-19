import {
  IsString,
  MinLength,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';
export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(10)
  description!: string;
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  @IsOptional()
  @IsNumber()
  parentCategoryId?: number;
}
