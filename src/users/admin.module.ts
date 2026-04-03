// import { Module } from '@nestjs/common';
// import { AdminController } from './admin.controller';
// import { AdminService } from './admin.service';
// import { TypeOrmModule } from '@nestjs/typeorm';

// import { UsersModule } from '../users/users.module'; // <-- import UsersModule
// import { User } from './entities/user.entity';
// import { Product } from '../products/entities/product.entity';
// import { Order } from '../orders/entities/order.entity';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([User, Product, Order]),
//     UsersModule,
//   ],
//   controllers: [AdminController],
//   providers: [AdminService],
// })
// // export class AdminModule {}