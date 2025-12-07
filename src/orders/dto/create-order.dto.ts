import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsArray,
  IsInt,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({
    description: 'The description of the order',
    example: 'Customer order for 5 items',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Order description is required' })
  @IsString({ message: 'Order description must be a string' })
  @MaxLength(100, { message: 'Order description cannot exceed 100 characters' })
  orderDescription: string;

  @ApiProperty({
    description: 'Array of product IDs to associate with this order',
    example: [1, 2, 3],
    type: [Number],
    isArray: true,
  })
  @IsArray({ message: 'Product IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one product ID is required' })
  @IsInt({ each: true, message: 'Each product ID must be an integer' })
  @Type(() => Number)
  productIds: number[];
}
