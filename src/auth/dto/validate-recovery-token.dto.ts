import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class ValidateRecoveryTokenDto {
  @ApiProperty({ description: '6-digit recovery code', example: '123456' })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  email: string;
}
