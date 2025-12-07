import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
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
  private readonly logger = new Logger(OrdersService.name);

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

    this.logger.log(`Fetching orders - Page: ${page}, Limit: ${limit}`);

    try {
      const [data, total] = await this.ordersRepository.findAndCount({
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Successfully fetched ${data.length} orders out of ${total} total`,
      );

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
      this.logger.error(
        `Failed to fetch orders - Page: ${page}, Limit: ${limit}`,
        error.stack,
      );
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
      this.logger.warn(`Invalid order ID attempted: ${id}`);
      throw new BadRequestException('Invalid order ID');
    }

    this.logger.log(`Fetching order with ID: ${id}`);

    try {
      const order = await this.ordersRepository.findOne({ where: { id } });

      if (!order) {
        this.logger.warn(`Order not found - ID: ${id}`);
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      this.logger.log(`Successfully fetched order - ID: ${id}`);
      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch order - ID: ${id}`, error.stack);
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
    this.logger.log(`Creating new order: ${JSON.stringify(createOrderDto)}`);

    try {
      const order = this.ordersRepository.create({
        orderDescription: createOrderDto.orderDescription,
        createdAt: new Date(),
      });

      const savedOrder = await this.ordersRepository.save(order);

      this.logger.log(`Successfully created order - ID: ${savedOrder.id}`);
      return savedOrder;
    } catch (error) {
      this.logger.error(
        `Failed to create order: ${JSON.stringify(createOrderDto)}`,
        error.stack,
      );
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
      this.logger.warn(`Invalid order ID attempted for update: ${id}`);
      throw new BadRequestException('Invalid order ID');
    }

    this.logger.log(
      `Updating order - ID: ${id}, Data: ${JSON.stringify(updateOrderDto)}`,
    );

    try {
      const order = await this.getOrderById(id);

      if (updateOrderDto.orderDescription) {
        order.orderDescription = updateOrderDto.orderDescription;
      }

      const updatedOrder = await this.ordersRepository.save(order);

      this.logger.log(`Successfully updated order - ID: ${id}`);
      return updatedOrder;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Failed to update order - ID: ${id}`, error.stack);
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
      this.logger.warn(`Invalid order ID attempted for deletion: ${id}`);
      throw new BadRequestException('Invalid order ID');
    }

    this.logger.log(`Deleting order - ID: ${id}`);

    try {
      const order = await this.getOrderById(id);
      await this.ordersRepository.remove(order);

      this.logger.log(`Successfully deleted order - ID: ${id}`);
      return { message: `Order with ID ${id} has been deleted successfully` };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Failed to delete order - ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'Failed to delete order',
        error.message,
      );
    }
  }
}
