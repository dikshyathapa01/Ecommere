import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from '../users/auth/auth.guard';
@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  createPayment(@Req() req: Request, @Body() dto: CreatePaymentDto) {
    const user = (req as any).user;
    return this.paymentsService.createPayment(user, dto);
  }

  @Post('confirm')
  confirmPayment(@Body('paymentId') paymentId: string, @Body('transactionId') transactionId: string) {
    return this.paymentsService.confirmPayment(paymentId, transactionId);
  }

  @Get('history')
  getUserPayments(@Req() req: Request) {
    const user = (req as any).user;
    return this.paymentsService.getUserPayments(user);
  }
}
