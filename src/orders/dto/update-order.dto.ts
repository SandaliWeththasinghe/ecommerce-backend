import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
