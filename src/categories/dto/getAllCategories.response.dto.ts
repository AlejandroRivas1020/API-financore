import { ApiProperty } from '@nestjs/swagger';

export class ResponseCategoriesAllDto {
  @ApiProperty({ example: 200 })
  status: number;

  @ApiProperty({
    example: [
      {
        id: 'cdef1234-abcd-5678-ef90-1234567890ab',
        name: 'savings',
      },
    ],
  })
  data: any[];

  @ApiProperty({ example: '¡Budgets found successfully!' })
  message: string;
}
