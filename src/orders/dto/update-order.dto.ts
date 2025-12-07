import {
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'The updated description of the order',
    example: 'Updated customer order for 10 items',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Order description must be a string' })
  @MaxLength(100, { message: 'Order description cannot exceed 100 characters' })
  orderDescription?: string;

  @ApiProperty({
    description: 'Updated array of product IDs to associate with this order',
    example: [1, 2, 4],
    type: [Number],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Product IDs must be an array' })
  @IsInt({ each: true, message: 'Each product ID must be an integer' })
  @Type(() => Number)
  productIds?: number[];
}
