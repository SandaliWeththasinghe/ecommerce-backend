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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from '@/orders/orders.service';
import { CreateOrderDto } from '@/orders/dto/create-order.dto';
import { UpdateOrderDto } from '@/orders/dto/update-order.dto';
import { PaginationQueryDto } from '@/orders/dto/pagination-query.dto';
import { Order } from '@/orders/entities/order.entity';
import { PaginatedResponse } from '@/orders/interfaces/paginated-response.interface';

@ApiTags('orders')
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
  @ApiOperation({
    summary: 'Get all orders with pagination and search',
    description:
      'Retrieve orders with optional search by order ID or description',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search keyword to filter by order ID or order description',
    example: 'laptop',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of orders',
    type: Order,
    isArray: true,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Returns the order',
    type: Order,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid ID' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: Order,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({ summary: 'Update an existing order' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: Order,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({ summary: 'Delete an order' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Order deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Order with ID 1 has been deleted successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid ID' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteOrder(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    this.logger.log(`DELETE /api/orders/${id} - Delete order`);
    return this.ordersService.deleteOrder(id);
  }
}
