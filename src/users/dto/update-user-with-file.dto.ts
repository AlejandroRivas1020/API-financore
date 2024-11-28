import { ApiProperty } from '@nestjs/swagger';
import { UpdateUserDto } from './update-user.dto';

export class UpdateUserWithFileDto extends UpdateUserDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile picture of the contact',
    required: false,
  })
  file?: any;
}
