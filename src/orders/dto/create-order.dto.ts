import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
