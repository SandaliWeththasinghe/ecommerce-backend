import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderProductMap } from '@/orders/entities/order-product-map.entity';
import { Product } from '@/orders/entities/product.entity';

@Entity('orders')
export class Order {
  @ApiProperty({
    description: 'The unique identifier of the order',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The description of the order',
    example: 'Customer order for 5 items',
    maxLength: 100,
  })
  @Column({ name: 'orderdescription', type: 'varchar', length: 100 })
  orderDescription: string;

  @ApiProperty({
    description: 'The date and time when the order was created',
    example: '2024-12-07T10:30:00.000Z',
  })
  @CreateDateColumn({ name: 'createdat', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => OrderProductMap, (orderProductMap) => orderProductMap.order)
  orderProducts: OrderProductMap[];

  @ApiProperty({
    description: 'Products associated with this order',
    type: () => Product,
    isArray: true,
  })
  products?: Product[];
}
