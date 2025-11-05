import { Module } from "@nestjs/common";  
import { OrdersController } from "./orders.controller";
import { Order } from "./entities/order.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderItem } from "./entities/order-item.entity";
import { UsersModule } from "../users/users.module";
import { OrdersService } from "./orders.service";
import { Payment } from "../payment/entities/payment.entity";

@Module({
  imports:[
      TypeOrmModule.forFeature([Order,OrderItem,Payment]),UsersModule,
    ],
  controllers:[OrdersController],
  providers:[ OrdersService],
exports:[OrdersService]
})
export class OrderModule{}