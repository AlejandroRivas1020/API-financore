import { ApiProperty } from '@nestjs/swagger';

export class ResponseFindOneEarningDto {
  @ApiProperty({ example: 200 })
  status: number;

  @ApiProperty({
    example: {
      id: 'cdef1234-abcd-5678-ef90-1234567890ab',
      name: 'Monthly Salary',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      generalAmount: 1500000,
      amountBudgeted: 500000,
      user: {
        id: 'abcdef12-3456-7890-abcd-1234567890ef',
        name: 'John Doe',
      },
    },
  })
  data: {
    id: string;
    name: string;
    startDate?: Date;
    endDate?: Date;
    generalAmount: number;
    amountBudgeted?: number;
    user: {
      id: string;
      name: string;
    };
  };

  @ApiProperty({ example: 'Earning found successfully' })
  message: string;
}
