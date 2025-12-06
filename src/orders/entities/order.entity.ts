import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'orderdescription', type: 'varchar', length: 100 })
  orderDescription: string;

  @CreateDateColumn({ name: 'createdat', type: 'timestamp' })
  createdAt: Date;
}
