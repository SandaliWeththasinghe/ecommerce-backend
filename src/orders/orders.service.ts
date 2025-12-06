import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  /**
   * Get all orders
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      return await this.ordersRepository.find({
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch orders',
        error.message,
      );
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: number): Promise<Order> {
    if (!id || id <= 0) {
      throw new BadRequestException('Invalid order ID');
    }

    try {
      const order = await this.ordersRepository.findOne({ where: { id } });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch order',
        error.message,
      );
    }
  }

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

  /**
   * Update an existing order
   */
  async updateOrder(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    if (!id || id <= 0) {
      throw new BadRequestException('Invalid order ID');
    }

    try {
      const order = await this.getOrderById(id);

      if (updateOrderDto.orderDescription) {
        order.orderDescription = updateOrderDto.orderDescription;
      }

      return await this.ordersRepository.save(order);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update order',
        error.message,
      );
    }
  }
}
