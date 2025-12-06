import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';

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
}
