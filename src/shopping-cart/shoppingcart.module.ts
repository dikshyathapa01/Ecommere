import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingCartItem } from './entities/shoppingcart.entity';
import { ShoppingCartService } from './shoppingcart.service';
import { ShoppingCartController } from './shoppingcart.controller';
import { Product } from '../products/entities/product.entity';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([ShoppingCartItem, Product]),
UsersModule,
  JwtModule.register({
    secret:process.env.JWT_SECRET || 'defaultSecret',
    signOptions:{expiresIn: '1h'},}),
  ],
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService],
  exports: [ShoppingCartService],
})
export class ShoppingCartModule {}
