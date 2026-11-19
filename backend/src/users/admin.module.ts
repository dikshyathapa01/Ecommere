import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from './entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { UsersModule } from './users.module';
import { AuthGuard } from './auth/auth.guard';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, Order]), UsersModule],
  controllers: [AdminController],
  providers: [AdminService, AuthGuard, RolesGuard],
})
export class AdminModule {}
