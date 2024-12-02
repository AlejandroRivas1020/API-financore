import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateBudgetDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  startDate?: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  endDate?: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  categoryId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  earningId?: string;
}
