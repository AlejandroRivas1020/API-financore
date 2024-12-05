import { ApiProperty } from '@nestjs/swagger';

export class ResponseBudgetAllDto {
  @ApiProperty({ example: 200 })
  status: number;

  @ApiProperty({
    example: [
      {
        id: 'cdef1234-abcd-5678-ef90-1234567890ab',
        name: 'Monthly Budget',
        description: 'This is the budget for November.',
        amount: 500000,
        startDate: '2024-11-01',
        endDate: '2024-12-01',
        category: { id: 'category-id', name: 'Savings' },
        earning: { id: 'earning-id', name: 'Salary' },
        user: { id: 'user-id', name: 'John Doe' },
      },
    ],
  })
  data: any[];

  @ApiProperty({ example: '¡Budgets found successfully!' })
  message: string;
}
