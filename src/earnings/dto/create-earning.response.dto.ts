import { ApiProperty } from '@nestjs/swagger';

export class ResponseEarningDto {
  @ApiProperty({ example: 201 })
  status: number;

  @ApiProperty({
    example: {
      id: 'cdef1234-abcd-5678-ef90-1234567890ab',
      name: 'Monthly Salary',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      generalAmount: 1500000,
      amountBudgeted: 500000, 
    },
  })
  data: {
    id: string;
    name: string;
    startDate?: Date;
    endDate?: Date;
    generalAmount: number;
    amountBudgeted?: number;
  };

  @ApiProperty({ example: 'Earning successfully created' })
  message: string;
}
