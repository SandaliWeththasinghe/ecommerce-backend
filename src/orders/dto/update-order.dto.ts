import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsString({ message: 'Order description must be a string' })
  @MaxLength(100, { message: 'Order description cannot exceed 100 characters' })
  orderDescription?: string;
}
