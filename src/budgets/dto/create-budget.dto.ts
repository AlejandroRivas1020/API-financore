import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsString,
  IsNumber,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'Name of the budget',
    example: 'Monthly Budget',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Optional description of the budget',
    example: 'Budget allocated for November expenses',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Amount allocated to the budget',
    example: 500000,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Start date of the budget period',
    example: '2024-11-01',
    required: false,
  })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    description: 'End date of the budget period',
    example: '2024-12-01',
    required: false,
  })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @ApiProperty({
    description: 'UUID of the associated category',
    example: 'cdef1234-abcd-5678-ef90-1234567890ab',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'UUID of the associated earning',
    example: 'fghi5678-ijkl-1234-mnop-567890abcdef',
  })
  @IsNotEmpty()
  @IsUUID()
  earningId: string;
}
