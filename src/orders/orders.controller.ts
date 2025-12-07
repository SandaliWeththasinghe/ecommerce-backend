import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { OrdersService } from '@/orders/orders.service';
import { CreateOrderDto } from '@/orders/dto/create-order.dto';
import { UpdateOrderDto } from '@/orders/dto/update-order.dto';
import { PaginationQueryDto } from '@/orders/dto/pagination-query.dto';
import { Order } from '@/orders/entities/order.entity';
import { PaginatedResponse } from '@/orders/interfaces/paginated-response.interface';

@Controller('api/orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /api/orders
   * Get all orders with pagination
   * Query params: page (default: 1), limit (default: 10, max: 100)
   */
  @Get()
  async getAllOrders(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Order>> {
    this.logger.log('GET /api/orders - Fetch all orders');
    return this.ordersService.getAllOrders(paginationQuery);
  }

  /**
   * GET /api/orders/:id
   * Get order by ID
   */
  @Get(':id')
  async getOrderById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    this.logger.log(`GET /api/orders/${id} - Fetch order by ID`);
    return this.ordersService.getOrderById(id);
  }

  /**
   * POST /api/orders
   * Create a new order
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    this.logger.log('POST /api/orders - Create new order');
    return this.ordersService.createOrder(createOrderDto);
  }

  /**
   * PUT /api/orders/:id
   * Update an order
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    this.logger.log(`PUT /api/orders/${id} - Update order`);
    return this.ordersService.updateOrder(id, updateOrderDto);
  }

  /**
   * DELETE /api/orders/:id
   * Delete an order
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteOrder(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    this.logger.log(`DELETE /api/orders/${id} - Delete order`);
    return this.ordersService.deleteOrder(id);
  }
}
