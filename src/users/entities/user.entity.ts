import { Column, Entity, PrimaryGeneratedColumn,OneToMany } from 'typeorm';
import { ShoppingCartItem } from '../../shopping-cart/entities/shoppingcart.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Order } from '../../orders/entities/order.entity';
//import { Order } from '../../orders/entities/order.entity';

export enum UserRole{
  USER='user',
  ADMIN='admin'
}
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({select:false})
  password: string;

  @Column()
  PhoneNumber: string;

  @Column()
  address: string;
  @Column({type:'enum',enum:UserRole,default:UserRole.USER})
  role:UserRole;

  @Column({nullable: true})
  profilePictureId: string;
  
  @Column({ type: 'text', array: true, default: [] })
imageIds: string[]; 
  @OneToMany(() => Order, (order) => order.user, { cascade: true })
  orders: Order[];
@OneToMany(() => ShoppingCartItem, (cartItem) => cartItem.user)
cartItems: ShoppingCartItem[];
@OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

}
