import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { UpdateProductDto } from '../products/dto/update-products.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getDashboardStats() {
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      this.userRepository.count(),
      this.productRepository.count(),
      this.orderRepository.count(),
    ]);
    const revenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.totalAmount), 0)', 'total')
      .getRawOne<{ total: string }>();

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Number(revenue?.total || 0),
    };
  }

  getAllProducts() {
    return this.productRepository.find({ order: { name: 'ASC' } });
  }

  getAllOrders() {
    return this.orderRepository.find({
      relations: { user: true, orderItems: true },
      order: { orderDate: 'DESC' },
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found');
    this.productRepository.merge(product, dto);
    return this.productRepository.save(product);
  }

  async deleteProduct(id: string) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepository.remove(product);
  }
}
