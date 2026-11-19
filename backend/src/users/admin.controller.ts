import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Auth } from './decorators/auth.decorator';
import { UserRole } from './entities/user.entity';
import { UpdateProductDto } from '../products/dto/update-products.dto';

@Controller('admin')
@Auth(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('products')
  getAllProducts() {
    return this.adminService.getAllProducts();
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @Get('orders')
  getAllOrders() {
    return this.adminService.getAllOrders();
  }
}
