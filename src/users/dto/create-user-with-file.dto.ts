import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class CreateUserWithFileDto extends CreateUserDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile picture of the contact',
    required: false,
  })
  file?: any;
}
