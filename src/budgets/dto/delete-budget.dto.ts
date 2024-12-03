import { ApiProperty } from '@nestjs/swagger';

export class ResponseBudgetDeleteDto {
  @ApiProperty({
    example: 200,
  })
  status: number;

  @ApiProperty({
    example: 'Budget successfully deleted',
  })
  message: string;
}
