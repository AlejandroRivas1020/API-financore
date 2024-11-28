import { ApiProperty } from '@nestjs/swagger';
import { RegisterUserDto } from './register-user.dto';

export class CreateRegisterWithFileDto extends RegisterUserDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile picture of the contact',
    required: false,
  })
  file?: any;
}
