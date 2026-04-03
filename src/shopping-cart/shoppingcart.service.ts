import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingCartItem } from './entities/shoppingcart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ShoppingCartService {
  constructor(
    @InjectRepository(ShoppingCartItem)
    private readonly cartRepo: Repository<ShoppingCartItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

 async getUserCart(userId: string) {
  return this.cartRepo.find({
    where: { userId },
    relations: ['product'],
  });
}

  async addToCart(user: User, dto: AddToCartDto) {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    let item = await this.cartRepo.findOne({ where: { userId: user.id, productId: dto.productId } });

    if (item) {
      item.quantity += dto.quantity;
    } else {
      item = this.cartRepo.create({ userId: user.id, productId: dto.productId, quantity: dto.quantity });
    }

    return this.cartRepo.save(item);
  }

  async updateQuantity(id: string, quantity: number, user: User) {
    const item = await this.cartRepo.findOne({ where: { id, userId: user.id } });
    if (!item) throw new NotFoundException('Cart item not found');
    item.quantity = quantity;
    return this.cartRepo.save(item);
  }

  async removeItem(id: string, user: User) {
    const item = await this.cartRepo.findOne({ where: { id, userId: user.id } });
    if (!item) throw new NotFoundException('Cart item not found');
    return this.cartRepo.remove(item);
  }

  async clearCart(user: User) {
    await this.cartRepo.delete({ userId: user.id });
    return { message: 'Cart cleared successfully' };
  }
}
