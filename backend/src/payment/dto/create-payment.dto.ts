import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  orderId!: string;

  @IsOptional()
  @IsIn(['manual', 'esewa', 'khalti'])
  gateway?: 'manual' | 'esewa' | 'khalti';
}
