import { Controller, Get, Post, Body, Delete, Param, Put, UseGuards, Req } from '@nestjs/common';
import { ShoppingCartService } from './shoppingcart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { AuthGuard } from '../users/auth/auth.guard';


@Controller('shopping-cart')
@UseGuards(AuthGuard)
export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  @Get()
  getCart(@Req() req: Request) {
    const user = (req as any).user;
    return this.shoppingCartService.getUserCart(user);
  }

  @Post()
  addToCart(@Req() req: Request, @Body() dto: AddToCartDto) {
    const user = (req as any).user;
    return this.shoppingCartService.addToCart(user, dto);
  }

  @Put(':id')
  updateQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.shoppingCartService.updateQuantity(id, quantity, user);
  }

  @Delete(':id')
  removeItem(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.shoppingCartService.removeItem(id, user);
  }

  @Delete('clear')
  clearCart(@Req() req: Request) {
    const user = (req as any).user;
    return this.shoppingCartService.clearCart(user);
  }
}
