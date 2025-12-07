import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

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
}
