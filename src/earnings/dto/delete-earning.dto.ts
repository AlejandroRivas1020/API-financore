import { ApiProperty } from '@nestjs/swagger';

export class ResponseEarningDeleteDto {
  @ApiProperty({ example: 200 })
  status: number;

  @ApiProperty({ example: 'Earning deleted successfully' })
  message: string;
}
