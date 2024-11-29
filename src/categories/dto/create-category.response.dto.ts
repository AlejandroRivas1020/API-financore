import { ApiProperty } from '@nestjs/swagger';

export class ResponseCategoryDto {
  @ApiProperty({ example: 201 })
  status: number;

  @ApiProperty({
    example: {
      id: 'cdef1234-abcd-5678-ef90-1234567890ab',
      name: 'Savings',
    },
  })
  data: {
    id: string;
    name: string;
  };

  @ApiProperty({ example: 'Category successfully created' })
  message: string;
}
