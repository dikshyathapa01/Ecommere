import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payment.service';
import { PaymentsController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';



@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order]),
   UsersModule,
     JwtModule.register({
    secret:process.env.JWT_SECRET || 'defaultSecret',
    signOptions:{expiresIn: '1h'},}),
    ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
