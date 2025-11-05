import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { User } from '../../users/entities/user.entity';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'paypal'
  | 'cash_on_delivery';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
userId: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;
@Column({ type: 'float', nullable: true, default: 0 })
totalPrice: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status: OrderStatus;

  @Column()
  shippingAddress: string;

  @Column({
    type: 'enum',
    enum: ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'],
  })
  paymentMethod: PaymentMethod;

  @CreateDateColumn()
  orderDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveryDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  user: User;
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];
  @OneToOne(() => Payment, (payment) => payment.order)
payment: Payment;

}