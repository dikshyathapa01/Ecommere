import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('shopping_cart_items')
export class ShoppingCartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 1 })
  quantity: number;

  @Column()
  userId: string;

  @Column()
  productId: string; 

  product: Product;

  @CreateDateColumn()
  createdAt: Date;
   @ManyToOne(() => User, (user) => user.cartItems, { onDelete: 'CASCADE' })
  user: User;
}
