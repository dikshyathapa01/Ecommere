// import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
// import { AdminService } from './admin.service';
// import { AuthGuard } from './auth/auth.guard';
// import { RolesGuard } from './auth/roles.guard';
// import { Roles } from './decorators/roles.decorator';
// import { UserRole } from './entities/user.entity';
// import { CreateProductDto } from '../products/dto/create-product.dto';
// import { UpdateProductDto } from '../products/dto/update-products.dto';

// @Controller('admin')
// @UseGuards(AuthGuard, RolesGuard)
// export class AdminController {
//   constructor(private readonly adminService: AdminService) {}

//   @Get('dashboard')
//   @Roles(UserRole.ADMIN)
//   async getDashboardStats() {
//     return await this.adminService.getDashboardStats();
//   }

//   @Get('users')
//   @Roles(UserRole.ADMIN)
//   async getAllUsers() {
//     return await this.adminService.getAllUsers();
//   }

//   @Get('orders')
//   @Roles(UserRole.ADMIN)
//   async getAllOrders() {
//     return await this.adminService.getAllOrders();
//   }

//   @Get('products')
//   @Roles(UserRole.ADMIN)
//   async getAllProducts() {
//     return await this.adminService.getAllProducts();
//   }

//   @Post('products')
//   @Roles(UserRole.ADMIN)
//   async createProduct(@Body() dto: CreateProductDto) {
//     return await this.adminService.createProduct(dto);
//   }

//   @Patch('products/:id')
//   @Roles(UserRole.ADMIN)
//   async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
//     return await this.adminService.updateProduct(id, dto);
//   }

//   @Delete('products/:id')
//   @Roles(UserRole.ADMIN)
//   async deleteProduct(@Param('id') id: string) {
//     return await this.adminService.deleteProduct(id);
//   }
// }