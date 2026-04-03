import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { User } from "../../users/entities/user.entity";

@Entity('shopping_cart_items')
export class ShoppingCartItem {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: 1 })
  quantity!: number;

  @Column('uuid')
  userId!: string;

  @Column('uuid')
  productId!: string;

  @ManyToOne(() => Product, { eager: false })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @ManyToOne(() => User, (user) => user.cartItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}