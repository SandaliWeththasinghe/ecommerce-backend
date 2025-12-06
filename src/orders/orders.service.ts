import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  /**
   * Create a new order
   */
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const order = this.ordersRepository.create({
        orderDescription: createOrderDto.orderDescription,
        createdAt: new Date(),
      });

      return await this.ordersRepository.save(order);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create order',
        error.message,
      );
    }
  }
}
