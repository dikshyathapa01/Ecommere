import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new payment for a user's order
   */
  async createPayment(user: User, dto: CreatePaymentDto) {
    // Find the order and make sure it belongs to the user
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId, userId: user.id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Create the payment entity
    const gateway = dto.gateway ?? 'manual';
    const amount = Number(order.totalPrice || order.totalAmount || 0);

    const payment = this.paymentRepo.create({
      user,
      order,
      gateway,
      amount,
      status: 'pending',
    });

    const savedPayment = await this.paymentRepo.save(payment);

    if (gateway === 'esewa') {
      return this.buildEsewaInitiation(savedPayment, order, amount);
    }

    if (gateway === 'khalti') {
      return await this.buildKhaltiInitiation(savedPayment, order, amount);
    }

    return savedPayment;
  }

  /**
   * Confirm a payment (mark as completed)
   */
  async confirmPayment(
    paymentId: string,
    transactionId: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['user', 'order'], // load relations if needed
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = 'completed';
    payment.transactionId = transactionId;

    return this.paymentRepo.save(payment);
  }

  /**
   * Get all payments for a specific user
   */
  async getUserPayments(user: User): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { user: { id: user.id } },
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Optionally, get a single payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['user', 'order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  buildEsewaInitiation(payment: Payment, order: Order, amount: number) {
    const esewa = this.configService.get('esewa') as {
      merchantCode: string;
      secretKey: string;
      baseUrl: string;
      callbackBaseUrl: string;
    };

    const totalAmount = amount.toFixed(2);
    const transactionUuid = payment.id;
    const signatureBase = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${esewa.merchantCode}`;
    const signature = createHmac('sha256', esewa.secretKey)
      .update(signatureBase)
      .digest('base64');

    return {
      payment,
      gateway: 'esewa',
      paymentUrl: esewa.baseUrl,
      formFields: {
        amount: totalAmount,
        tax_amount: '0',
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: esewa.merchantCode,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: `${esewa.callbackBaseUrl}/api/payments/esewa/success`,
        failure_url: `${esewa.callbackBaseUrl}/api/payments/esewa/failure`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
      orderId: order.id,
    };
  }

  async buildKhaltiInitiation(payment: Payment, order: Order, amount: number) {
    const khalti = this.configService.get('khalti') as {
      secretKey: string;
      baseUrl: string;
      callbackBaseUrl: string;
    };

    if (!khalti.secretKey) {
      throw new BadGatewayException('KHALTI_SECRET_KEY is not configured');
    }

    const payload = {
      return_url: `${khalti.callbackBaseUrl}/payment-callback?paymentId=${payment.id}`,
      website_url: khalti.callbackBaseUrl,
      amount: Math.round(amount * 100),
      purchase_order_id: payment.id,
      purchase_order_name: `Order ${order.id}`,
    };

    const response = await fetch(`${khalti.baseUrl}/epayment/initiate/`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${khalti.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new BadGatewayException(
        `Khalti initiation failed: ${details || response.statusText}`,
      );
    }

    const result = (await response.json()) as {
      pidx: string;
      payment_url: string;
    };

    return {
      payment,
      gateway: 'khalti',
      paymentUrl: result.payment_url,
      pidx: result.pidx,
      orderId: order.id,
    };
  }

  async completeKhaltiPayment(paymentId: string, pidx: string) {
    const khalti = this.configService.get('khalti') as {
      secretKey: string;
      baseUrl: string;
    };

    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['user', 'order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const response = await fetch(`${khalti.baseUrl}/epayment/lookup/`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${khalti.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    });

    if (!response.ok) {
      throw new BadGatewayException('Unable to verify Khalti payment');
    }

    const lookup = (await response.json()) as {
      status: string;
      transaction_id?: string;
    };

    if (lookup.status !== 'Completed') {
      throw new BadGatewayException(`Khalti payment status: ${lookup.status}`);
    }

    payment.status = 'completed';
    payment.transactionId = lookup.transaction_id || pidx;
    return this.paymentRepo.save(payment);
  }

  async completeEsewaPayment(paymentId: string, transactionId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['user', 'order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = 'completed';
    payment.transactionId = transactionId;

    return this.paymentRepo.save(payment);
  }
}
