import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Order description is required' })
  @IsString({ message: 'Order description must be a string' })
  @MaxLength(100, { message: 'Order description cannot exceed 100 characters' })
  orderDescription: string;
}
