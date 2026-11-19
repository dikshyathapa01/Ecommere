import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from '../users/auth/auth.guard';
import type { Response } from 'express';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  createPayment(@Req() req: Request, @Body() dto: CreatePaymentDto) {
    const user = (req as any).user;
    return this.paymentsService.createPayment(user, dto);
  }

  @Post('confirm')
  @UseGuards(AuthGuard)
  confirmPayment(
    @Body('paymentId') paymentId: string,
    @Body('transactionId') transactionId: string,
  ) {
    return this.paymentsService.confirmPayment(paymentId, transactionId);
  }

  @Get('history')
  @UseGuards(AuthGuard)
  getUserPayments(@Req() req: Request) {
    const user = (req as any).user;
    return this.paymentsService.getUserPayments(user);
  }

  @Get('esewa/success')
  async esewaSuccess(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const paymentId = query.transaction_uuid || query.pid || query.paymentId;
    const transactionId =
      query.ref_id || query.refId || query.transaction_code || paymentId;

    if (paymentId) {
      await this.paymentsService.completeEsewaPayment(paymentId, transactionId);
    }

    return res.redirect(
      `${FRONTEND_URL}/payment-callback?status=success&gateway=esewa`,
    );
  }

  @Get('esewa/failure')
  esewaFailure(@Query() query: Record<string, string>, @Res() res: Response) {
    const status = query.status || 'failed';
    return res.redirect(
      `${FRONTEND_URL}/payment-callback?status=${encodeURIComponent(status)}&gateway=esewa`,
    );
  }

  /**
   * Khalti redirects the user back here after payment.
   * We then redirect to the frontend payment-callback page with pidx + status.
   */
  @Get('khalti/callback')
  async khaltiCallback(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const paymentId = query.paymentId;
    const pidx = query.pidx;
    const status = query.status;

    // Forward all params to frontend; frontend will call /verify to confirm
    const params = new URLSearchParams({
      pidx: pidx || '',
      status: status || 'failed',
      paymentId: paymentId || '',
      gateway: 'khalti',
    });

    return res.redirect(
      `${FRONTEND_URL}/payment-callback?${params.toString()}`,
    );
  }

  /**
   * Frontend calls this endpoint (authenticated) to verify the Khalti payment
   * by pidx after being redirected back from Khalti.
   */
  @Post('khalti/verify')
  @UseGuards(AuthGuard)
  async khaltiVerify(
    @Body('pidx') pidx: string,
    @Body('paymentId') paymentId: string,
  ) {
    return this.paymentsService.completeKhaltiPayment(paymentId, pidx);
  }
}
