import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from '@/orders/orders.service';
import { CreateOrderDto } from '@/orders/dto/create-order.dto';
import { UpdateOrderDto } from '@/orders/dto/update-order.dto';
import { Order } from '@/orders/entities/order.entity';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /api/orders
   * Get all orders
   */
  @Get()
  async getAllOrders(): Promise<Order[]> {
    return this.ordersService.getAllOrders();
  }

  /**
   * GET /api/orders/:id
   * Get order by ID
   */
  @Get(':id')
  async getOrderById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
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
    return this.ordersService.deleteOrder(id);
  }
}
