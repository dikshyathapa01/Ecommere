import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import {CategoriesModule } from './categories/categories.module';
import { OrderModule } from './orders/orders.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import { UploadModule } from './upload/upload.module';
import { ShoppingCartModule } from './shopping-cart/shoppingcart.module';
import { PaymentsModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import config from 'config/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
// import { AdminModule } from './users/admin.module';
@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true,
    load:[config],
  }),
      ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'frontend'), // <-- your frontend folder
      exclude: ['/api/{*path}'], // keep backend API routes accessible
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
    synchronize:false,
  }),UsersModule,ProductsModule,CategoriesModule,OrderModule, UploadModule,PaymentsModule,ShoppingCartModule,],//AdminModule
  controllers: [AppController],
  providers: [AppService],
  exports: [TypeOrmModule],
})
export class AppModule {}
