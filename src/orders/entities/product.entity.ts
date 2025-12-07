import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('products')
export class Product {
  @ApiProperty({
    description: 'The unique identifier of the product',
    example: 1,
  })
  @PrimaryColumn()
  id: number;

  @ApiProperty({
    description: 'The name of the product',
    example: 'HP laptop',
  })
  @Column({ name: 'productname', type: 'varchar', length: 100 })
  productName: string;

  @ApiProperty({
    description: 'The description of the product',
    example: 'This is HP laptop',
    required: false,
  })
  @Column({ name: 'productdescription', type: 'text', nullable: true })
  productDescription: string;
}
