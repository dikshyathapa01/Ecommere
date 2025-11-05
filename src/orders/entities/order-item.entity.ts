import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { Order } from "./order.entity";
@Entity()
export class OrderItem{
@PrimaryGeneratedColumn("uuid")
  id: string;
  // @Column()
  // productId: number;
  @Column()
  quantity: number;
  @Column('decimal')
  price: number;
  @ManyToOne(()=>Product,(product)=>product.id)
  @JoinColumn({name:'productId'})
  product:Product;
   @ManyToOne(() => Order, (order) => order.orderItems)
  order: Order;

}