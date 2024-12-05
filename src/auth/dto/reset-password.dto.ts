import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsEmail } from 'class-validator';

export class ResetPasswordDto {
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

  @ApiProperty({ description: 'New password', example: 'NewP@ssw0rd' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  newPassword: string;
}
