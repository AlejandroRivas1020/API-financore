import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Amount of the transaction',
    example: 15000.1,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'ID of the budget to associate ',
    example: 'budget-id',
  })
  @IsUUID()
  budgetId: string;

  @ApiProperty({
    description: 'Description of the transaction',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
