import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEarningDto {
  @ApiProperty({
    example: 'Monthly Salary',
    description: 'The name of the earning',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Start date of the earning',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({
    example: '2024-12-31',
    description: 'End date of the earning',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({
    example: 1500000,
    description: 'The total amount of the earning',
  })
  @IsNotEmpty()
  @IsNumber()
  generalAmount: number;

  @ApiProperty({
    example: 'user-id-1234',
    description: 'The user to whom the earning belongs',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  userId: string;
}
