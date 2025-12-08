import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '@/orders/entities/order.entity';
import { Product } from '@/orders/entities/product.entity';
import { OrderProductMap } from '@/orders/entities/order-product-map.entity';
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
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(OrderProductMap)
    private orderProductMapRepository: Repository<OrderProductMap>,
  ) {}

  /**
   * Get all orders with pagination, search, and their products
   */
  async getAllOrders(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Order>> {
    const { page = 1, limit = 10, search } = paginationQuery;

    this.logger.log(
      `Fetching orders - Page: ${page}, Limit: ${limit}, Search: ${search || 'none'}`,
    );

    try {
      // Build query with search conditions
      const queryBuilder = this.ordersRepository
        .createQueryBuilder('orders')
        .orderBy('orders.createdat', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      // Add search filter if search term is provided
      if (search && search.trim()) {
        const searchTerm = search.trim();

        // Check if search term is a number (for ID search)
        const isNumeric = /^\d+$/.test(searchTerm);

        if (isNumeric) {
          // Search by ID or description
          queryBuilder.where(
            '(orders.id = :searchId OR LOWER(orders.orderdescription) LIKE LOWER(:searchDesc))',
            {
              searchId: parseInt(searchTerm),
              searchDesc: `%${searchTerm}%`,
            },
          );
        } else {
          // Search only by description
          queryBuilder.where(
            'LOWER(orders.orderdescription) LIKE LOWER(:searchDesc)',
            {
              searchDesc: `%${searchTerm}%`,
            },
          );
        }
      }

      const [orders, total] = await queryBuilder.getManyAndCount();

      // Fetch products for each order
      const ordersWithProducts = await Promise.all(
        orders.map(async (order) => {
          const products = await this.getOrderProducts(order.id);
          return { ...order, products };
        }),
      );

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Successfully fetched ${ordersWithProducts.length} orders out of ${total} total (Search: ${search || 'none'})`,
      );

      return {
        data: ordersWithProducts,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch orders - Page: ${page}, Limit: ${limit}, Search: ${search}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch orders',
        error.message,
      );
    }
  }

  /**
   * Get order by ID with products
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

      // Fetch products for this order
      const products = await this.getOrderProducts(id);
      order.products = products;

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
   * Create a new order with products
   */
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    this.logger.log(`Creating new order: ${JSON.stringify(createOrderDto)}`);

    try {
      // Validate that all product IDs exist
      await this.validateProducts(createOrderDto.productIds);

      // Create the order
      const order = this.ordersRepository.create({
        orderDescription: createOrderDto.orderDescription,
        createdAt: new Date(),
      });

      const savedOrder = await this.ordersRepository.save(order);

      // Create order-product mappings
      await this.saveOrderProducts(savedOrder.id, createOrderDto.productIds);

      // Fetch the order with products
      const orderWithProducts = await this.getOrderById(savedOrder.id);

      this.logger.log(`Successfully created order - ID: ${savedOrder.id}`);
      return orderWithProducts;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
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
      const order = await this.ordersRepository.findOne({ where: { id } });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Update order description if provided
      if (updateOrderDto.orderDescription) {
        order.orderDescription = updateOrderDto.orderDescription;
        await this.ordersRepository.save(order);
      }

      // Update products if provided
      if (updateOrderDto.productIds && updateOrderDto.productIds.length > 0) {
        // Validate products
        await this.validateProducts(updateOrderDto.productIds);

        // Delete existing mappings
        await this.orderProductMapRepository.delete({ orderId: id });

        // Create new mappings
        await this.saveOrderProducts(id, updateOrderDto.productIds);
      }

      // Fetch the updated order with products
      const updatedOrder = await this.getOrderById(id);

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
   * Delete an order (cascade will delete order-product mappings)
   */
  async deleteOrder(id: number): Promise<{ message: string }> {
    if (!id || id <= 0) {
      this.logger.warn(`Invalid order ID attempted for deletion: ${id}`);
      throw new BadRequestException('Invalid order ID');
    }

    this.logger.log(`Deleting order - ID: ${id}`);

    try {
      const order = await this.ordersRepository.findOne({ where: { id } });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // The ON DELETE CASCADE will automatically delete related OrderProductMap entries
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

  /**
   * Helper method to get products for an order
   */
  private async getOrderProducts(orderId: number): Promise<Product[]> {
    const orderProductMaps = await this.orderProductMapRepository.find({
      where: { orderId },
      relations: ['product'],
    });

    return orderProductMaps.map((map) => map.product);
  }

  /**
   * Helper method to validate if products exist
   */
  private async validateProducts(productIds: number[]): Promise<void> {
    const products = await this.productsRepository.find({
      where: { id: In(productIds) },
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Products with IDs ${missingIds.join(', ')} do not exist`,
      );
    }
  }

  /**
   * Helper method to save order-product mappings
   */
  private async saveOrderProducts(
    orderId: number,
    productIds: number[],
  ): Promise<void> {
    const orderProductMaps = productIds.map((productId) =>
      this.orderProductMapRepository.create({
        orderId,
        productId,
      }),
    );

    await this.orderProductMapRepository.save(orderProductMaps);
  }
}
