import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from '@/orders/orders.controller';
import { OrdersService } from '@/orders/orders.service';
import { Order } from '@/orders/entities/order.entity';
import { Product } from '@/orders/entities/product.entity';
import { OrderProductMap } from '@/orders/entities/order-product-map.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, OrderProductMap])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
