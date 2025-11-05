import {Column,Entity,OneToMany,PrimaryGeneratedColumn} from 'typeorm'
import { OrderItem } from '../../orders/entities/order-item.entity';
import { ShoppingCartItem } from '../../shopping-cart/entities/shoppingcart.entity';
@Entity()
export class Product{
@PrimaryGeneratedColumn('uuid')
id:string;
@Column()
name:string;
@Column()
price:number;
@Column()
description:string;
@Column()
brand:string;
@Column({ type: 'text', array: true, default: [] })
imageIds: string[]; 
//@Column()
//imageUrl:string;
@Column({type:'jsonb'})//json le problem huna sakxa yesle caii binary ma save garne vako vayera use garya 
variant:variant[];
@OneToMany(()=>OrderItem,(orderItem)=> orderItem.product)
OrderItems:OrderItem[]
// @OneToMany(() => ShoppingCartItem, (cartItem) => cartItem.product)
// cartItems: ShoppingCartItem[];

}
type variant={
    color:string;
    size:string;
    stock:number;
}