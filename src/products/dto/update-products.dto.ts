 //import { IsOptional, IsString, IsNumber, MinLength } from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { PartialType } from '@nestjs/mapped-types';
//  export class UpdateProductDto {
//   @IsOptional()
//   @IsString()
//   @MinLength(2)
//   name?: string;
//   @IsOptional()
//   @IsNumber()
//   price?: number;
//   @IsOptional()
//   @IsString()
//   @MinLength(5)
//   description?: string;
//  }
export class UpdateProductDto extends PartialType(CreateProductDto) {}
