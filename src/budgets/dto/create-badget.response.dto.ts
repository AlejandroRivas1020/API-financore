import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../categories/entities/category.entity';
import { Earning } from '../../earnings/entities/earning.entity';
import { User } from '../../users/entities/user.entity';

export class ResponseBudgetDto {
  @ApiProperty({ example: 201 })
  status: number;

  @ApiProperty({
    example: {
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
  })
  data: {
    id: string;
    name: string;
    description?: string;
    amount: number;
    startDate?: Date;
    endDate?: Date;
    category?: Partial<Category>;
    earning: Partial<Earning>;
    user: Partial<User>;
  };

  @ApiProperty({ example: 'Budget successfully created' })
  message: string;
}
