import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';
import { Column, FindOperator, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../entities/order.entity';

export class OrderItem{
 
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
  @Column()
  orderId: string;
  @IsNumber()
  @IsPositive()
  price: number;
 @ManyToOne(() => Product, (product) => product.OrderItems)
@JoinColumn({ name: 'productId' })
product: Product;


  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;
  productId: string | FindOperator<string> | undefined;
}
