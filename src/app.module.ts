import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import {CategoriesModule } from './categories/categories.module';
import { OrderModule } from './orders/orders.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import { UploadModule } from './upload/upload.module';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Category } from './categories/entities/catagory.entity';
import { Order } from './orders/entities/order.entity';
import { Payment } from './payment/entities/payment.entity';
import { Upload } from './upload/upload.entity';
import { ShoppingCartModule } from './shopping-cart/shoppingcart.module';
import { PaymentsModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import config from 'config/config';
@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true,
    load:[config],
  }),
  TypeOrmModule.forRoot({
    //use variables from config
    //@ts-expect-error dbType from env us string but TypeORM expects specific union
    type:config().database.dbType,
    host:config().database.host,
    port:config().database.port,
    username:config().database.username,
    password:config().database.password,
    autoLoadEntities:true,
    database:config().database.databaseName,
    synchronize:false
  }),UsersModule,ProductsModule,CategoriesModule,OrderModule, UploadModule,PaymentsModule,ShoppingCartModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [TypeOrmModule],
})
export class AppModule {}
