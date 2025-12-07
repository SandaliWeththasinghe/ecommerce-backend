import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '@/orders/entities/order.entity';
import { CreateOrderDto } from '@/orders/dto/create-order.dto';
import { UpdateOrderDto } from '@/orders/dto/update-order.dto';
import { PaginationQueryDto } from '@/orders/dto/pagination-query.dto';
import { PaginatedResponse } from '@/orders/interfaces/paginated-response.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  /**
   * Get all orders with pagination
   */
  async getAllOrders(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Order>> {
    const { page = 1, limit = 10 } = paginationQuery;

    try {
      const [data, total] = await this.ordersRepository.findAndCount({
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
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
  async updateOrder(
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
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

  /**
   * Delete an order
   */
  async deleteOrder(id: number): Promise<{ message: string }> {
    if (!id || id <= 0) {
      throw new BadRequestException('Invalid order ID');
    }

    try {
      const order = await this.getOrderById(id);
      await this.ordersRepository.remove(order);

      return { message: `Order with ID ${id} has been deleted successfully` };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete order',
        error.message,
      );
    }
  }
}
