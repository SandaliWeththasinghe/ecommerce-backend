import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '@/orders/entities/order.entity';
import { Product } from '@/orders/entities/product.entity';

@Entity('orderproductmap')
export class OrderProductMap {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'orderid' })
  orderId: number;

  @Column({ name: 'productid' })
  productId: number;

  @ManyToOne(() => Order, (order) => order.orderProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderid' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productid' })
  product: Product;
}
