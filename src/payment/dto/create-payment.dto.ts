import { IsUUID } from 'class-validator';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class CreatePaymentDto {
   @PrimaryGeneratedColumn()
  id: number;
 @Column()
  orderId: string;
  @Column()
  amount: number;
@Column()
  userId: string;
}
