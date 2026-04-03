// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from './entities/user.entity';
// import { Product } from '../products/entities/product.entity';
// import { Order } from '../orders/entities/order.entity';
// import { CreateProductDto } from '../products/dto/create-product.dto';
// import { UpdateProductDto } from '../products/dto/update-products.dto';

// @Injectable()
// export class AdminService {
//   constructor(
//     @InjectRepository(User) private userRepo: Repository<User>,
//     @InjectRepository(Product) private productRepo: Repository<Product>,
//     @InjectRepository(Order) private orderRepo: Repository<Order>,
//   ) {}

//   // Dashboard stats
//   async getDashboardStats() {
//     const totalUsers = await this.userRepo.count();
//     const totalProducts = await this.productRepo.count();
//     const totalOrders = await this.orderRepo.count();
//     const totalRevenue = await this.orderRepo
//       .createQueryBuilder('order')
//       .select('SUM(order.total)', 'sum')
//       .getRawOne();

//     // Example: last 7 days sales (dummy labels & values, replace with real query)
//     const sales = {
//       labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
//       values: [100,200,150,400,300,250,500],
//     };

//     return { totalUsers, totalProducts, totalOrders, totalRevenue: totalRevenue.sum || 0, sales };
//   }

//   // List all users
//   async getAllUsers() {
//     return this.userRepo.find({ select: ['id', 'name', 'email', 'PhoneNumber', 'role'] });
//   }

//   // List all orders
//   async getAllOrders() {
//     return this.orderRepo.find({ relations: ['user', 'products'] });
//   }

//   // List all products
//   async getAllProducts() {
//     return this.productRepo.find();
//   }

//   // Create product
//   async createProduct(dto: CreateProductDto) {
//     const product = this.productRepo.create(dto);
//     return this.productRepo.save(product);
//   }

// async updateProduct(id: string, dto: UpdateProductDto) {
//   const product = await this.productRepo.findOneBy({ id }); // <-- pass string directly
//   if (!product) throw new NotFoundException('Product not found');
//   Object.assign(product, dto);
//   return this.productRepo.save(product);
// }

// // Delete product
// async deleteProduct(id: string) {
//   const product = await this.productRepo.findOneBy({ id }); // <-- pass string directly
//   if (!product) throw new NotFoundException('Product not found');
//   return this.productRepo.remove(product);
// }
// }