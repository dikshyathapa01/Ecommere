import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  /**
   * Create a new payment for a user's order
   */
  async createPayment(user: User, dto: CreatePaymentDto): Promise<Payment> {
    // Find the order and make sure it belongs to the user
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId, userId: user.id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Create the payment entity
    const payment = this.paymentRepo.create({
      user,
      order,
      amount: order.totalPrice,
      status: 'pending',
    });

    return this.paymentRepo.save(payment);
  }

  /**
   * Confirm a payment (mark as completed)
   */
  async confirmPayment(paymentId: string, transactionId: string): Promise<Payment> {
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
}
